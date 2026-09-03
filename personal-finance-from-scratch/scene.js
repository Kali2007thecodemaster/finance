/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — scene.js

   One object: a struck coin, tumbling end over end as the page
   scrolls. Nothing else is in the scene — no floor, no backdrop,
   no fog. The canvas is transparent, so the coin floats on the
   page's own paper.

   Realism here comes from four things, in order of how much they
   matter:

     1. A prefiltered environment map. Metal is almost entirely
        reflection; without one, gold renders as beige plastic.
        A studio is drawn to an equirectangular canvas at runtime
        and pushed through PMREMGenerator.
     2. Genuine relief. A height field is drawn for each face —
        rim, beading, arc lettering, devices — and converted to a
        tangent-space normal map with a Sobel pass, so the strike
        catches light the way a real one does instead of being a
        picture of a coin.
     3. Roughness variation. High points polish, recesses hold
        dirt, and the fields carry faint radial die-polish lines.
     4. Correct colour pipeline: sRGB output with ACES tone
        mapping, colour maps tagged sRGB and data maps left linear.

   Every texture is generated at runtime. No image asset is
   fetched or shipped.

   This file runs on index.html ONLY — the reader pages load
   neither three.js nor this file, deliberately.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var canvas = document.getElementById('scene-canvas');
  if (!canvas) { return; }

  function bailOut(reason) {
    root.setAttribute('data-scene', 'fallback');
    root.setAttribute('data-scene-reason', reason);
  }

  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof THREE === 'undefined') { bailOut('no-three'); return; }

  var probeOk = false;
  try {
    var probe = document.createElement('canvas');
    probeOk = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch (err) { probeOk = false; }
  if (!probeOk) { bailOut('no-webgl'); return; }

  var isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var LOW_END = window.innerWidth < 820 || isCoarse ||
                (navigator.hardwareConcurrency || 8) <= 4;

  var TEX = LOW_END ? 1024 : 2048;          /* face map resolution   */
  var SEGMENTS = LOW_END ? 160 : 320;       /* silhouette smoothness */
  var TAU = Math.PI * 2;

  /* ============================================================
     1. CANVAS DRAWING HELPERS
     ============================================================ */

  function surface(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /* Text set along a circular arc, letter by letter. `sweep` is the
     total angle the string occupies; `flip` runs it along the lower
     arc so the bottom legend reads right way up.                   */
  function arcText(ctx, str, cx, cy, radius, startAngle, sweep, flip) {
    /*  A lower-arc legend sweeps right-to-left across the screen, so its
        characters have to be laid down in reverse for the word to read
        left-to-right once each glyph is rotated upright.              */
    var chars = flip ? str.split('').reverse() : str.split('');
    var step = sweep / Math.max(1, chars.length - 1);
    for (var i = 0; i < chars.length; i++) {
      var a = startAngle + step * i;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
    }
  }

  function ring(ctx, cx, cy, radius, width, value) {
    ctx.strokeStyle = value;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.stroke();
  }

  /* the ring of small raised beads just inside the rim */
  function beading(ctx, cx, cy, radius, count, dotR, value) {
    ctx.fillStyle = value;
    for (var i = 0; i < count; i++) {
      var a = (i / count) * TAU;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, dotR, 0, TAU);
      ctx.fill();
    }
  }

  function star(ctx, cx, cy, r, value) {
    ctx.fillStyle = value;
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = (i % 2 === 0) ? r : r * 0.44;
      var a = -Math.PI / 2 + (i / 10) * TAU;
      var x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  /* one laurel leaf, drawn as a filled quadratic lens */
  function leaf(ctx, x, y, len, wide, angle, value) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = value;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.45, -wide, len, 0);
    ctx.quadraticCurveTo(len * 0.45, wide, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  /* ============================================================
     2. HEIGHT FIELDS — the actual strike
     Drawn in greyscale: mid grey is the field, lighter is raised,
     darker is incuse. Converted to a normal map below.
     ============================================================ */

  var FIELD = '#808080';
  var HIGH  = '#f2f2f2';
  var MID   = '#c8c8c8';
  var LOW   = '#3a3a3a';

  function faceHeight(which) {
    var S = TEX;
    var c = surface(S, S);
    var x = c.getContext('2d');
    var cx = S / 2, cy = S / 2;
    var R = S / 2;

    /* outside the coin's circle is never sampled, but fill it so the
       Sobel pass at the silhouette has something continuous to read */
    x.fillStyle = FIELD;
    x.fillRect(0, 0, S, S);

    /* --- raised rim: a broad collar, highest at its outer edge --- */
    var rimGrad = x.createRadialGradient(cx, cy, R * 0.855, cx, cy, R * 0.995);
    rimGrad.addColorStop(0.00, FIELD);
    rimGrad.addColorStop(0.35, '#d6d6d6');
    rimGrad.addColorStop(0.80, HIGH);
    rimGrad.addColorStop(1.00, '#b4b4b4');
    x.fillStyle = rimGrad;
    x.beginPath();
    x.arc(cx, cy, R * 0.995, 0, TAU);
    x.arc(cx, cy, R * 0.855, 0, TAU, true);
    x.fill();

    /* --- beading inside the rim --- */
    beading(x, cx, cy, R * 0.818, Math.round(R / 11), R * 0.0125, MID);

    /* --- a fine incuse guide line --- */
    ring(x, cx, cy, R * 0.775, S * 0.0025, '#6e6e6e');

    x.textAlign = 'center';
    x.textBaseline = 'middle';

    if (which === 'obverse') {
      /* ===== the reverse of the coin, shown to the camera: the common
         loon on the water — CANADA above, DOLLAR below ===== */
      x.font = '600 ' + Math.round(S * 0.070) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'CANADA', cx, cy, R * 0.708, Math.PI * 1.345, Math.PI * 0.31, false);
      x.font = '600 ' + Math.round(S * 0.066) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'DOLLAR', cx, cy, R * 0.712, Math.PI * 0.345, Math.PI * 0.31, true);

      /* the RCM security mark — a small raised roundel, above the loon */
      x.fillStyle = MID;
      x.beginPath();
      x.arc(cx, cy - R * 0.46, R * 0.058, 0, TAU);
      x.fill();
      x.strokeStyle = HIGH; x.lineWidth = S * 0.004;
      x.beginPath(); x.arc(cx, cy - R * 0.46, R * 0.058, 0, TAU); x.stroke();

      /* water — a few incuse ripple lines low on the field */
      x.strokeStyle = LOW;
      x.lineWidth = S * 0.006;
      for (var wl = 0; wl < 4; wl++) {
        var wy = cy + R * (0.30 + wl * 0.085);
        var span = R * (0.60 - wl * 0.05);
        x.beginPath();
        x.moveTo(cx - span, wy);
        x.bezierCurveTo(cx - span * 0.4, wy - R * 0.03, cx + span * 0.4, wy + R * 0.03, cx + span, wy);
        x.stroke();
      }

      /* the loon, swimming right, drawn as one raised silhouette */
      x.fillStyle = HIGH;
      x.beginPath();
      x.moveTo(cx - R * 0.34, cy + R * 0.17);                                   /* tail, low-left      */
      x.bezierCurveTo(cx - R * 0.30, cy - R * 0.02, cx - R * 0.06, cy - R * 0.04, cx + R * 0.06, cy + R * 0.00); /* back rising right   */
      x.bezierCurveTo(cx + R * 0.15, cy + R * 0.02, cx + R * 0.20, cy - R * 0.10, cx + R * 0.245, cy - R * 0.235); /* up the back of neck */
      x.bezierCurveTo(cx + R * 0.265, cy - R * 0.30, cx + R * 0.34, cy - R * 0.315, cx + R * 0.37, cy - R * 0.265); /* over the head       */
      x.lineTo(cx + R * 0.52, cy - R * 0.235);                                  /* beak, pointing right*/
      x.lineTo(cx + R * 0.37, cy - R * 0.205);
      x.bezierCurveTo(cx + R * 0.315, cy - R * 0.16, cx + R * 0.30, cy - R * 0.09, cx + R * 0.235, cy - R * 0.03); /* front of neck down  */
      x.bezierCurveTo(cx + R * 0.16, cy + R * 0.05, cx + R * 0.06, cy + R * 0.10, cx - R * 0.06, cy + R * 0.15);   /* breast to belly     */
      x.bezierCurveTo(cx - R * 0.18, cy + R * 0.19, cx - R * 0.28, cy + R * 0.20, cx - R * 0.34, cy + R * 0.17);   /* belly back to tail  */
      x.closePath();
      x.fill();

      /* eye (incuse) and a soft back highlight (checker-like loon plumage) */
      x.fillStyle = LOW;
      x.beginPath(); x.arc(cx + R * 0.315, cy - R * 0.245, R * 0.016, 0, TAU); x.fill();
      x.strokeStyle = MID; x.lineWidth = S * 0.004;
      for (var pl = 0; pl < 5; pl++) {
        x.beginPath();
        x.moveTo(cx - R * 0.24 + pl * R * 0.075, cy - R * 0.01);
        x.lineTo(cx - R * 0.20 + pl * R * 0.075, cy + R * 0.06);
        x.stroke();
      }

    } else {
      /* ===== the obverse of the coin: the sovereign's right-facing
         profile — ELIZABETH II  /  D · G · REGINA  /  year ===== */
      x.font = '600 ' + Math.round(S * 0.052) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'ELIZABETH II', cx, cy, R * 0.712, Math.PI * 1.36, Math.PI * 0.40, false);
      arcText(x, 'D \u00B7 G \u00B7 REGINA', cx, cy, R * 0.712, Math.PI * 0.30, Math.PI * 0.40, true);

      x.fillStyle = MID;
      x.font = '500 ' + Math.round(S * 0.060) + 'px Georgia, "Times New Roman", serif';
      x.fillText('2026', cx, cy + R * 0.56);

      /* a right-facing profile bust, raised */
      x.fillStyle = HIGH;
      x.beginPath();
      x.moveTo(cx - R * 0.16, cy - R * 0.40);                                   /* crown           */
      x.bezierCurveTo(cx + R * 0.06, cy - R * 0.44, cx + R * 0.19, cy - R * 0.30, cx + R * 0.185, cy - R * 0.14); /* forehead        */
      x.bezierCurveTo(cx + R * 0.245, cy - R * 0.12, cx + R * 0.255, cy - R * 0.05, cx + R * 0.20, cy - R * 0.02); /* nose bridge/tip */
      x.bezierCurveTo(cx + R * 0.235, cy + R * 0.02, cx + R * 0.20, cy + R * 0.05, cx + R * 0.175, cy + R * 0.075);/* lips            */
      x.bezierCurveTo(cx + R * 0.205, cy + R * 0.12, cx + R * 0.165, cy + R * 0.17, cx + R * 0.10, cy + R * 0.185);/* chin            */
      x.bezierCurveTo(cx + R * 0.09, cy + R * 0.27, cx + R * 0.12, cy + R * 0.34, cx + R * 0.155, cy + R * 0.40); /* neck to bust    */
      x.lineTo(cx - R * 0.20, cy + R * 0.40);                                   /* shoulder base   */
      x.bezierCurveTo(cx - R * 0.20, cy + R * 0.16, cx - R * 0.30, cy + R * 0.10, cx - R * 0.285, cy - R * 0.06); /* nape / hair mass*/
      x.bezierCurveTo(cx - R * 0.31, cy - R * 0.22, cx - R * 0.30, cy - R * 0.36, cx - R * 0.16, cy - R * 0.40);  /* back of hair    */
      x.closePath();
      x.fill();

      /* a couple of incuse hair lines + a crown hint */
      x.strokeStyle = MID; x.lineWidth = S * 0.004;
      for (var hl = 0; hl < 4; hl++) {
        x.beginPath();
        x.moveTo(cx - R * 0.24, cy - R * 0.24 + hl * R * 0.10);
        x.bezierCurveTo(cx - R * 0.14, cy - R * 0.20 + hl * R * 0.10, cx - R * 0.02, cy - R * 0.16 + hl * R * 0.10, cx + R * 0.06, cy - R * 0.10 + hl * R * 0.10);
        x.stroke();
      }
    }

    /* soften: a real die has no infinitely sharp corner, and an
       unblurred height field turns every edge into normal-map noise */
    if (typeof x.filter === 'string') {
      var blurred = surface(S, S);
      var b = blurred.getContext('2d');
      b.filter = 'blur(' + Math.max(1, S / 700).toFixed(2) + 'px)';
      b.drawImage(c, 0, 0);
      return blurred;
    }
    return c;
  }

  /*  CylinderGeometry maps its caps as u = cos(theta), v = sin(theta) —
      the axes are swapped relative to a canvas, so a face texture lands
      rotated a quarter turn. The bottom cap additionally negates v, which
      mirrors it. Both are cancelled here, on the HEIGHT field, before any
      derived map is computed — so colour, roughness and the Sobel-derived
      normals all stay in agreement with one another.                   */
  function orientCap(src, sign) {
    var S = src.width;
    var out = surface(S, S);
    var o = out.getContext('2d');
    o.translate(S / 2, S / 2);
    o.rotate(-Math.PI / 2);
    if (sign < 0) { o.scale(-1, 1); }
    o.drawImage(src, -S / 2, -S / 2);
    return out;
  }

  /* the milled edge — the reeding you feel on a coin's rim */
  function edgeHeight() {
    var W = 2048, H = 64;
    var c = surface(W, H);
    var x = c.getContext('2d');
    x.fillStyle = FIELD;
    x.fillRect(0, 0, W, H);

    var reeds = 132;
    var step = W / reeds;
    for (var i = 0; i < reeds; i++) {
      var g = x.createLinearGradient(i * step, 0, (i + 1) * step, 0);
      g.addColorStop(0.00, LOW);
      g.addColorStop(0.42, HIGH);
      g.addColorStop(0.58, HIGH);
      g.addColorStop(1.00, LOW);
      x.fillStyle = g;
      x.fillRect(i * step, 0, step, H);
    }
    /* the rim's chamfer: the reeding dies away at both lips */
    var fade = x.createLinearGradient(0, 0, 0, H);
    fade.addColorStop(0.00, 'rgba(128,128,128,1)');
    fade.addColorStop(0.16, 'rgba(128,128,128,0)');
    fade.addColorStop(0.84, 'rgba(128,128,128,0)');
    fade.addColorStop(1.00, 'rgba(128,128,128,1)');
    x.fillStyle = fade;
    x.fillRect(0, 0, W, H);
    return c;
  }

  /* ============================================================
     3. HEIGHT -> TANGENT-SPACE NORMAL MAP (Sobel)
     three.js uses the OpenGL convention, so +G points up.
     ============================================================ */

  function normalFromHeight(heightCanvas, strength) {
    var W = heightCanvas.width, H = heightCanvas.height;
    var src = heightCanvas.getContext('2d').getImageData(0, 0, W, H).data;

    var out = surface(W, H);
    var octx = out.getContext('2d');
    var img = octx.createImageData(W, H);
    var d = img.data;

    function h(px, py) {
      var xx = px < 0 ? 0 : (px >= W ? W - 1 : px);
      var yy = py < 0 ? 0 : (py >= H ? H - 1 : py);
      return src[(yy * W + xx) * 4] / 255;
    }

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var tl = h(x - 1, y - 1), t = h(x, y - 1), tr = h(x + 1, y - 1);
        var l  = h(x - 1, y),                      r  = h(x + 1, y);
        var bl = h(x - 1, y + 1), b = h(x, y + 1), br = h(x + 1, y + 1);

        var dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
        var dy = (bl + 2 * b + br) - (tl + 2 * t + tr);

        var nx = -dx * strength;
        var ny = -dy * strength;          /* +G up: screen-y is inverted */
        var nz = 1;
        var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

        var o = (y * W + x) * 4;
        d[o]     = ((nx / len) * 0.5 + 0.5) * 255;
        d[o + 1] = ((ny / len) * 0.5 + 0.5) * 255;
        d[o + 2] = ((nz / len) * 0.5 + 0.5) * 255;
        d[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    return out;
  }

  /* ---------- roughness, derived from the same relief ----------
     High points take wear and polish; recesses hold the dirt that
     never gets rubbed out. Plus faint radial die-polish lines.   */

  function roughnessFromHeight(heightCanvas, lo, hi) {
    var W = heightCanvas.width, H = heightCanvas.height;
    var src = heightCanvas.getContext('2d').getImageData(0, 0, W, H);
    var d = src.data;
    for (var i = 0; i < d.length; i += 4) {
      var height = d[i] / 255;
      var rough = hi - (hi - lo) * height;              /* raised = smoother */
      var jitter = (Math.random() - 0.5) * 0.05;
      var v = Math.max(0, Math.min(1, rough + jitter)) * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    var out = surface(W, H);
    var o = out.getContext('2d');
    o.putImageData(src, 0, 0);

    /* radial die-polish streaks, very faint */
    o.globalAlpha = 0.05;
    o.strokeStyle = '#000';
    o.lineWidth = Math.max(1, W / 900);
    var cx = W / 2, cy = H / 2;
    for (var k = 0; k < 220; k++) {
      var a = Math.random() * TAU;
      var r0 = (0.16 + Math.random() * 0.4) * W / 2;
      var r1 = r0 + (0.06 + Math.random() * 0.3) * W / 2;
      o.beginPath();
      o.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      o.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      o.stroke();
    }
    o.globalAlpha = 1;
    return out;
  }

  /* ---------- colour: gold, darkened where the relief is deep ---------- */

  function colourFromHeight(heightCanvas, base, shadow) {
    var W = heightCanvas.width, H = heightCanvas.height;
    var src = heightCanvas.getContext('2d').getImageData(0, 0, W, H);
    var d = src.data;
    var b = [parseInt(base.substr(1, 2), 16), parseInt(base.substr(3, 2), 16), parseInt(base.substr(5, 2), 16)];
    var s = [parseInt(shadow.substr(1, 2), 16), parseInt(shadow.substr(3, 2), 16), parseInt(shadow.substr(5, 2), 16)];
    for (var i = 0; i < d.length; i += 4) {
      var t = d[i] / 255;                                /* 0 incuse .. 1 raised */
      var k = 0.45 + 0.55 * t;                           /* recesses go darker   */
      d[i]     = s[0] + (b[0] - s[0]) * k;
      d[i + 1] = s[1] + (b[1] - s[1]) * k;
      d[i + 2] = s[2] + (b[2] - s[2]) * k;
      d[i + 3] = 255;
    }
    var out = surface(W, H);
    out.getContext('2d').putImageData(src, 0, 0);
    return out;
  }

  /* ============================================================
     4. STUDIO ENVIRONMENT (equirectangular, then prefiltered)
     ============================================================ */

  function studioEquirect(theme) {
    var W = 1024, H = 512;
    var c = surface(W, H);
    var x = c.getContext('2d');
    var light = theme === 'light';

    /*  Metal is almost pure reflection, so the environment IS what the
        coin looks like. Each theme gets a studio keyed near its own page
        ground so the coin's mid-reflections blend into the page and it
        feels embedded rather than pasted on: a dark-dominant studio for
        the charcoal theme, a bright studio for the paper theme. A few
        soft sources streak across either way to give the gold its
        highlights.                                                     */
    var g = x.createLinearGradient(0, 0, 0, H);
    if (light) {
      g.addColorStop(0.00, '#fbf7ee');
      g.addColorStop(0.34, '#ddd6c6');
      g.addColorStop(0.50, '#b6ae9c');   /* horizon — deeper, for contrast */
      g.addColorStop(0.74, '#807a6c');
      g.addColorStop(1.00, '#4b463d');   /* dark floor                     */
    } else {
      g.addColorStop(0.00, '#3a3a38');   /* dim ceiling glow   */
      g.addColorStop(0.34, '#262625');
      g.addColorStop(0.52, '#1b1b1a');   /* horizon, ~page bg  */
      g.addColorStop(0.72, '#161615');
      g.addColorStop(1.00, '#0d0d0c');   /* dark floor         */
    }
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    /* soft light sources — coloured, so the metal picks up warmth and
       a hint of the page's pink accent instead of flat white */
    function softbox(u, v, w, h, col, alpha) {
      var px = u * W, py = v * H;
      var rg = x.createRadialGradient(px, py, 0, px, py, Math.max(w, h));
      rg.addColorStop(0.0, 'rgba(' + col + ',' + alpha + ')');
      rg.addColorStop(0.45, 'rgba(' + col + ',' + (alpha * 0.4).toFixed(3) + ')');
      rg.addColorStop(1.0, 'rgba(' + col + ',0)');
      x.fillStyle = rg;
      x.fillRect(px - w, py - h, w * 2, h * 2);
    }
    /* key — large, warm, upper-left */
    softbox(0.24, 0.20, 210, 150, '255,248,232', 1.0);
    /* a hard bright core inside the key, for a crisp specular hotspot */
    softbox(0.24, 0.20, 60, 46, '255,255,255', 1.0);
    /* fill — cooler, right */
    softbox(0.74, 0.32, 165, 118, '214,222,236', 0.62);
    /* rim strip — the page's pink accent, low and wide, so the coin's
       lower edge catches a mauve highlight that ties it to the palette */
    softbox(0.52, 0.9, 300, 70, '236,196,224', 0.5);
    /* a thin overhead strip light, for a moving linear glint */
    x.fillStyle = 'rgba(255,252,244,0.5)';
    x.fillRect(W * 0.30, H * 0.045, W * 0.42, H * 0.02);

    if (light) {
      /* soft dark blockers — a polished coin needs darks to reflect even
         in a bright room, or the metal flattens into plastic */
      function blocker(u, v, w, h, a) {
        var px = u * W, py = v * H;
        var rg = x.createRadialGradient(px, py, 0, px, py, Math.max(w, h));
        rg.addColorStop(0.0, 'rgba(40,38,34,' + a + ')');
        rg.addColorStop(1.0, 'rgba(40,38,34,0)');
        x.fillStyle = rg;
        x.fillRect(px - w, py - h, w * 2, h * 2);
      }
      blocker(0.50, 0.32, 175, 140, 0.72);
      blocker(0.90, 0.44, 140, 165, 0.6);
      blocker(0.06, 0.42, 120, 150, 0.58);
      blocker(0.34, 0.62, 130, 120, 0.5);
    }

    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  /* ============================================================
     5. RENDERER / SCENE / CAMERA
     ============================================================ */

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,                       /* the page's paper shows through */
      powerPreference: 'high-performance'
    });
  } catch (err) { bailOut('renderer-failed'); return; }

  var DPR_CAP = LOW_END ? 1.75 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearAlpha(0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  var scene = new THREE.Scene();
  scene.background = null;

  var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0, 7.2);

  /* environment — rebuildable, so the coin re-lights when the theme
     toggles between the paper and charcoal studios */
  var currentEnv = null;
  function buildEnvironment(theme) {
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var eqTex = studioEquirect(theme);
    var envTex = pmrem.fromEquirectangular(eqTex).texture;
    eqTex.dispose();
    pmrem.dispose();
    if (currentEnv) { currentEnv.dispose(); }
    currentEnv = envTex;
    scene.environment = envTex;
  }

  function readTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  buildEnvironment(readTheme());

  /* direct light, for the moving specular the env map cannot give */
  var key = new THREE.DirectionalLight(0xfff2dc, 2.35);
  key.position.set(-3.2, 4.0, 5.0);
  scene.add(key);

  var fill = new THREE.DirectionalLight(0xd6deec, 0.55);
  fill.position.set(4.0, -2.2, 3.0);
  scene.add(fill);

  /* rim in the page's pink accent — grazes the top edge and ties the
     coin to the palette without tinting the whole face */
  var rim = new THREE.DirectionalLight(0xcd8dbd, 1.8);
  rim.position.set(1.4, 2.4, -4.5);
  scene.add(rim);

  /* a second warm rim from below-left, catching the opposite edge */
  var rim2 = new THREE.DirectionalLight(0xffe0b0, 0.9);
  rim2.position.set(-2.2, -2.6, -3.5);
  scene.add(rim2);

  /*  Per-theme exposure and rim balance. On the bright paper theme the
      studio already carries most of the light, so the direct rig is
      pulled back and exposure trimmed; on charcoal it is pushed. */
  var coinMats = [];   /* populated when the coin is built below */
  function applyThemeLook(theme) {
    var lightT = theme === 'light';
    if (lightT) {
      /* on paper the coin was washing out — trim exposure and, above all,
         cut the mirror reflection strength so the gold reads as gold with
         directional shape rather than a flat bright disc; push the key so
         the modelling comes from the lamp, not the room */
      renderer.toneMappingExposure = 0.98;
      key.intensity = 2.9;
      rim.intensity = 1.25;
      rim2.intensity = 0.7;
    } else {
      renderer.toneMappingExposure = 1.08;
      key.intensity = 2.35;
      rim.intensity = 1.8;
      rim2.intensity = 0.9;
    }
    for (var i = 0; i < coinMats.length; i++) {
      coinMats[i].envMapIntensity = coinMats[i].userData.emi * (lightT ? 0.52 : 1);
    }
  }
  applyThemeLook(readTheme());

  /* re-light the coin when the toggle fires (theme.js dispatches this) */
  window.addEventListener('themechange', function (e) {
    var t = (e && e.detail && e.detail.theme) === 'light' ? 'light' : 'dark';
    buildEnvironment(t);
    applyThemeLook(t);
    /* repaint immediately — under prefers-reduced-motion there is no
       render loop running to pick the new lighting up on its own */
    try { renderer.render(scene, camera); } catch (err) { /* not ready yet */ }
  });

  /* ============================================================
     6. THE COIN
     CylinderGeometry emits three material groups — side, top cap,
     bottom cap — which is exactly the split a coin needs: reeded
     edge, obverse, reverse. Rotating the geometry once puts the
     caps on ±Z, so a rotation about X is a true end-over-end flip.
     ============================================================ */

  function faceMaterial(which) {
    var height = orientCap(faceHeight(which), which === 'obverse' ? 1 : -1);

    var colour = new THREE.CanvasTexture(colourFromHeight(height, '#d6b24f', '#6a4f16'));
    colour.encoding = THREE.sRGBEncoding;
    colour.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var normal = new THREE.CanvasTexture(normalFromHeight(height, 3.4));
    normal.anisotropy = colour.anisotropy;

    var rough = new THREE.CanvasTexture(roughnessFromHeight(height, 0.05, 0.52));
    rough.anisotropy = colour.anisotropy;

    var mat = new THREE.MeshStandardMaterial({
      map: colour,
      normalMap: normal,
      normalScale: new THREE.Vector2(1.25, 1.25),
      roughnessMap: rough,
      roughness: 1.0,
      metalness: 1.0,
      envMapIntensity: 2.15
    });
    mat.userData.emi = 2.15;
    coinMats.push(mat);
    return mat;
  }

  function edgeMaterial() {
    /* the loonie has a PLAIN edge (no reeding) — smooth polished gold */
    var em = new THREE.MeshStandardMaterial({
      color: 0xcaa25a,
      metalness: 1.0,
      roughness: 0.24,
      envMapIntensity: 2.0,
      flatShading: true               /* read each of the 11 faces cleanly */
    });
    em.userData.emi = 2.0;
    coinMats.push(em);
    return em;
  }

  /* The loonie is an 11-sided coin (a rounded hendecagon). Eleven radial
     segments give that silhouette; the faces are still flat discs the
     relief maps onto. */
  var SIDES = 11;
  var RADIUS = 1.0;
  var THICKNESS = 0.13;

  var geo = new THREE.CylinderGeometry(RADIUS, RADIUS, THICKNESS, SIDES, 1, false);
  geo.rotateX(Math.PI / 2);              /* caps now face +Z / -Z */

  var coin = new THREE.Mesh(geo, [edgeMaterial(), faceMaterial('obverse'), faceMaterial('reverse')]);
  var coinGroup = new THREE.Group();
  coinGroup.add(coin);
  scene.add(coinGroup);
  applyThemeLook(readTheme());        /* now that coinMats is populated */

  /* ============================================================
     7. SCROLL STAGING
     The flip is scroll-linked; the coin's place on screen moves
     through one waypoint per page section.
     ============================================================ */

  /*  The coin stays in the right margin at every settled waypoint. The
      reading column is left/centre-aligned throughout, and dark text on a
      gold face is low-contrast even with the text layered on top — so the
      coin is never parked behind a title or a body block. It only sweeps
      across content in transit, where it is moving and clearly foreground.
      Vertical travel and the flip carry the motion; horizontal drift is
      kept small so nothing lurches. Scales stay modest mid-page and open
      up for the two display beats, hero and ledger.                     */
  var WAYPOINTS = [
    { x:  1.95, y:  0.06, scale: 1.06 },   /* 0 hero       */
    { x:  2.14, y:  0.62, scale: 0.50 },   /* 1 method     */
    { x:  2.22, y: -0.30, scale: 0.46 },   /* 2 sources    */
    { x:  2.20, y:  0.50, scale: 0.44 },   /* 3 curriculum */
    { x:  1.62, y:  0.42, scale: 0.72 }    /* 4 ledger — raised so the whole coin clears the footer */
  ];

  var FLIPS = 4;                            /* full tumbles top to bottom */

  var posCurve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(function (w) { return new THREE.Vector3(w.x, w.y, 0); }),
    false, 'catmullrom', 0.4
  );

  /*  A waypoint should be "reached" while its section is being read, not
      when its top crosses the viewport top — so each anchor is pulled up
      by a third of a viewport. That offset is baked into the ANCHORS and
      clamped at zero, rather than added to the scroll position: adding it
      to the scroll would mean the first waypoint is already a third of
      the way toward the second before the reader has scrolled at all.  */
  var LOOK_AHEAD = 0.34;
  var camSections = [];

  function measureSections() {
    camSections = [];
    var lead = window.innerHeight * LOOK_AHEAD;
    Array.prototype.forEach.call(document.querySelectorAll('[data-cam]'), function (el) {
      var idx = parseInt(el.getAttribute('data-cam'), 10);
      if (isNaN(idx)) return;
      var top = el.getBoundingClientRect().top + window.pageYOffset;
      camSections.push({ index: idx, anchor: Math.max(0, top - lead) });
    });
    camSections.sort(function (a, b) { return a.index - b.index; });
  }

  function sectionFraction() {
    var last = WAYPOINTS.length - 1;
    if (camSections.length < 2) return 0;
    var y = window.pageYOffset;
    if (y <= camSections[0].anchor) return camSections[0].index;
    for (var i = 0; i < camSections.length - 1; i++) {
      var a = camSections[i], b = camSections[i + 1];
      if (y >= a.anchor && y < b.anchor) {
        return Math.min(last, a.index +
          ((y - a.anchor) / Math.max(1, b.anchor - a.anchor)) * (b.index - a.index));
      }
    }
    return last;
  }

  /* 0..1 down the whole document — drives the flip itself */
  function pageProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.max(0, Math.min(1, window.pageYOffset / max)) : 0;
  }

  /* On a portrait viewport the coin steps back: smaller, lower, and
     nearer the centre, so it never competes with the hero copy.  */
  function responsive() {
    var aspect = window.innerWidth / window.innerHeight;
    /*  On a portrait phone the visible world half-width is barely wider than
        the coin's own radius, and the reading column runs full width — so the
        coin is shrunk hard and dropped into the lower-right corner, bleeding
        off the edge, where it stays clear of the copy while still tumbling
        down the margin as the page scrolls.                                */
    if (aspect < 0.72) return { xMul: 0.62, scaleMul: 0.40, yOff: -0.95 };
    if (aspect < 0.95) return { xMul: 0.66, scaleMul: 0.52, yOff: -0.78 };
    if (aspect < 1.35) return { xMul: 0.80, scaleMul: 0.74, yOff: -0.14 };
    return { xMul: 1, scaleMul: 1, yOff: 0 };
  }

  var pointerX = 0, pointerY = 0;
  if (!isCoarse) {
    window.addEventListener('mousemove', function (e) {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  var needsMeasure = true;
  function resize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    needsMeasure = true;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  measureSections();

  /* ============================================================
     8. RENDER
     Under prefers-reduced-motion the coin is still struck and still
     lit — it simply does not move. One frame, no loop, no scroll
     binding. The preference is about motion, not about the object.
     ============================================================ */

  var want = new THREE.Vector3();
  var have = new THREE.Vector3(WAYPOINTS[0].x, WAYPOINTS[0].y, 0);
  var haveScale = WAYPOINTS[0].scale;
  var haveFlip = 0;
  var elapsed = 0;
  var lastT = performance.now();
  var running = true;

  function stage(smoothing, dt) {
    var r = responsive();
    var last = WAYPOINTS.length - 1;
    var frac = sectionFraction();
    var u = last > 0 ? Math.max(0, Math.min(1, frac / last)) : 0;

    posCurve.getPoint(u, want);

    var i = Math.min(last, Math.floor(frac));
    var j = Math.min(last, i + 1);
    var t = frac - i;
    var scale = (WAYPOINTS[i].scale + (WAYPOINTS[j].scale - WAYPOINTS[i].scale) * t) * r.scaleMul;

    want.x *= r.xMul;
    want.y += r.yOff;
    want.x += pointerX * 0.10;
    want.y += -pointerY * 0.07;

    var k = smoothing ? 1 - Math.pow(0.0022, dt) : 1;
    have.lerp(want, k);
    haveScale += (scale - haveScale) * k;

    coinGroup.position.copy(have);
    coinGroup.scale.setScalar(haveScale);

    var flip = pageProgress() * FLIPS * TAU;
    haveFlip += (flip - haveFlip) * (smoothing ? k : 1);

    coin.rotation.x = haveFlip + (smoothing ? Math.sin(elapsed * 0.34) * 0.05 : 0);
    coin.rotation.y = (smoothing ? Math.sin(elapsed * 0.21) * 0.16 : 0.12) + pointerX * 0.13;
    coin.rotation.z = 0.10 + (smoothing ? Math.sin(elapsed * 0.16) * 0.03 : 0);
  }

  if (REDUCED_MOTION) {
    root.setAttribute('data-scene', 'live');
    root.setAttribute('data-scene-motion', 'static');
    measureSections();
    stage(false, 0);
    renderer.render(scene, camera);
    window.addEventListener('resize', function () {
      measureSections();
      stage(false, 0);
      renderer.render(scene, camera);
    });
    return;
  }

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { lastT = performance.now(); requestAnimationFrame(loop); }
  });

  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    elapsed += dt;

    if (needsMeasure) { measureSections(); needsMeasure = false; }
    stage(true, dt);
    renderer.render(scene, camera);
  }

  root.setAttribute('data-scene', 'live');
  requestAnimationFrame(loop);

})();
