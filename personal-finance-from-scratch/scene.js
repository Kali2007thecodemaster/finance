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

    if (which === 'obverse') {
      /* legend around the top, denomination-style value below */
      x.fillStyle = HIGH;
      x.textAlign = 'center';
      x.textBaseline = 'middle';

      x.font = '600 ' + Math.round(S * 0.062) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'PERSONAL FINANCE', cx, cy, R * 0.700, Math.PI * 1.30, Math.PI * 0.40, false);

      x.font = '600 ' + Math.round(S * 0.050) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'FROM SCRATCH', cx, cy, R * 0.705, Math.PI * 0.32, Math.PI * 0.36, true);

      star(x, cx - R * 0.700, cy + R * 0.020, R * 0.042, MID);
      star(x, cx + R * 0.700, cy + R * 0.020, R * 0.042, MID);

      /* the device: a struck currency mark, with a soft cameo behind
         it so the glyph sits on a slightly domed relief             */
      var cameo = x.createRadialGradient(cx, cy - R * 0.03, 0, cx, cy - R * 0.03, R * 0.40);
      cameo.addColorStop(0, '#a0a0a0');
      cameo.addColorStop(1, FIELD);
      x.fillStyle = cameo;
      x.beginPath();
      x.arc(cx, cy - R * 0.03, R * 0.40, 0, TAU);
      x.fill();

      x.fillStyle = HIGH;
      x.font = '700 ' + Math.round(S * 0.46) + 'px Georgia, "Times New Roman", serif';
      x.fillText('$', cx, cy - R * 0.045);

      x.fillStyle = MID;
      x.font = '500 ' + Math.round(S * 0.050) + 'px Georgia, "Times New Roman", serif';
      x.fillText('MMXXVI', cx, cy + R * 0.500);

    } else {
      /* reverse: laurel wreath around the book's own title */
      var i, a;
      for (i = 0; i < 13; i++) {
        a = Math.PI * 0.60 + (i / 12) * Math.PI * 0.74;          /* left branch  */
        leaf(x, cx + Math.cos(a) * R * 0.615, cy + Math.sin(a) * R * 0.615,
             R * 0.145, R * 0.052, a - Math.PI * 0.42, MID);
        a = Math.PI * 0.40 - (i / 12) * Math.PI * 0.74;          /* right branch */
        leaf(x, cx + Math.cos(a) * R * 0.615, cy + Math.sin(a) * R * 0.615,
             R * 0.145, R * 0.052, a + Math.PI * 0.42, MID);
      }

      x.fillStyle = HIGH;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.font = '600 ' + Math.round(S * 0.058) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'TEN MODULES', cx, cy, R * 0.700, Math.PI * 1.34, Math.PI * 0.32, false);

      x.font = '700 ' + Math.round(S * 0.115) + 'px Georgia, "Times New Roman", serif';
      x.fillText('FROM', cx, cy - R * 0.085);
      x.fillText('SCRATCH', cx, cy + R * 0.070);

      ring(x, cx, cy, R * 0.30, S * 0.004, '#6e6e6e');

      x.fillStyle = MID;
      x.font = '500 ' + Math.round(S * 0.046) + 'px Georgia, "Times New Roman", serif';
      arcText(x, 'ZERO KNOWLEDGE ASSUMED', cx, cy, R * 0.712, Math.PI * 0.26, Math.PI * 0.48, true);
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

  function studioEquirect() {
    var W = 1024, H = 512;
    var c = surface(W, H);
    var x = c.getContext('2d');

    /*  A DARK studio, to match the page's charcoal ground. Metal is
        almost pure reflection, so the environment is what the coin
        looks like — on a dark page it must be mostly dark, with a
        few bright soft sources streaking across. The dark tone is
        keyed near the page background (#222) so the coin's shadowed
        reflections blend into the page and it feels embedded rather
        than pasted on. This dark-dominant map is the single biggest
        realism win over the previous bright studio.                */
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.00, '#3a3a38');     /* dim ceiling glow  */
    g.addColorStop(0.34, '#262625');
    g.addColorStop(0.52, '#1b1b1a');     /* horizon, ~page bg */
    g.addColorStop(0.72, '#161615');
    g.addColorStop(1.00, '#0d0d0c');     /* dark floor        */
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

  /* environment */
  var pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  var eqTex = studioEquirect();
  var envMap = pmrem.fromEquirectangular(eqTex).texture;
  scene.environment = envMap;
  eqTex.dispose();
  pmrem.dispose();

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

  /* ============================================================
     6. THE COIN
     CylinderGeometry emits three material groups — side, top cap,
     bottom cap — which is exactly the split a coin needs: reeded
     edge, obverse, reverse. Rotating the geometry once puts the
     caps on ±Z, so a rotation about X is a true end-over-end flip.
     ============================================================ */

  function faceMaterial(which) {
    var height = orientCap(faceHeight(which), which === 'obverse' ? 1 : -1);

    var colour = new THREE.CanvasTexture(colourFromHeight(height, '#d8c07f', '#6f571f'));
    colour.encoding = THREE.sRGBEncoding;
    colour.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var normal = new THREE.CanvasTexture(normalFromHeight(height, 3.4));
    normal.anisotropy = colour.anisotropy;

    var rough = new THREE.CanvasTexture(roughnessFromHeight(height, 0.05, 0.52));
    rough.anisotropy = colour.anisotropy;

    return new THREE.MeshStandardMaterial({
      map: colour,
      normalMap: normal,
      normalScale: new THREE.Vector2(1.25, 1.25),
      roughnessMap: rough,
      roughness: 1.0,
      metalness: 1.0,
      envMapIntensity: 2.15
    });
  }

  function edgeMaterial() {
    var height = edgeHeight();
    var normal = new THREE.CanvasTexture(normalFromHeight(height, 2.6));
    normal.wrapS = THREE.RepeatWrapping;
    normal.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return new THREE.MeshStandardMaterial({
      color: 0xc9ad6e,
      metalness: 1.0,
      roughness: 0.16,
      normalMap: normal,
      normalScale: new THREE.Vector2(1.6, 1.6),
      envMapIntensity: 2.2
    });
  }

  var RADIUS = 1.0;
  var THICKNESS = 0.15;

  var geo = new THREE.CylinderGeometry(RADIUS, RADIUS, THICKNESS, SEGMENTS, 1, false);
  geo.rotateX(Math.PI / 2);              /* caps now face +Z / -Z */

  var coin = new THREE.Mesh(geo, [edgeMaterial(), faceMaterial('obverse'), faceMaterial('reverse')]);
  var coinGroup = new THREE.Group();
  coinGroup.add(coin);
  scene.add(coinGroup);

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
    { x:  1.66, y: -0.06, scale: 0.86 }    /* 4 ledger     */
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
