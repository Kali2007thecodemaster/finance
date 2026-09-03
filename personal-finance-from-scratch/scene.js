/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — scene.js
   The landing page's scroll-driven hero scene: a financial
   district at night, entered at street level and left from
   altitude, staged so the camera's height rises as the page
   moves from "zero-knowledge basics" toward the macro view.

   Structure, mirroring the reference three.js project:
     0. capability gate — reduced motion / no WebGL / no THREE
     1. procedural textures (facade, ground grid, particle sprite)
     2. scene content — skyline, ground plane, particles, lights
     3. camera rig — five waypoints through two CatmullRom splines
     4. hand-rolled bloom (bright pass -> separable blur -> add)
     5. scroll + pointer input
     6. render loop, with an FPS watchdog that degrades rather
        than stutters

   This file runs on index.html ONLY. The module reader pages are
   deliberately dependency-light and load neither three.js nor
   this file — see the plan's scope boundary.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var canvas = document.getElementById('scene-canvas');

  /* ============================================================
     0. CAPABILITY GATE
     If any of these fail we never touch three.js at all. The page
     is then carried by #scene-canvas's own CSS gradient plus the
     .scene-static grid, both defined in style.css — the fallback
     is the element's painted background, not a JS-drawn one, so
     it is already on screen before this file even runs.
     ============================================================ */

  function bailOut(reason) {
    root.setAttribute('data-scene', 'fallback');
    root.setAttribute('data-scene-reason', reason);
  }

  if (!canvas) { return; }

  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (REDUCED_MOTION) { bailOut('reduced-motion'); return; }
  if (typeof THREE === 'undefined') { bailOut('no-three'); return; }

  var probeOk = false;
  try {
    var probe = document.createElement('canvas');
    probeOk = !!(probe.getContext('webgl2') ||
                 probe.getContext('webgl') ||
                 probe.getContext('experimental-webgl'));
  } catch (err) {
    probeOk = false;
  }
  if (!probeOk) { bailOut('no-webgl'); return; }

  /* ---------- palette, matching style.css's tokens ---------- */

  var C_BG     = 0x0A0E14;   /* --bg / --ink   */
  var C_WARM   = 0xE36414;   /* --warm         */
  var C_MARKET = 0x3ADB76;   /* --market       */
  var C_MOON   = 0x8FA8C8;   /* cool moonlight */

  var isSmallViewport = window.innerWidth < 820;
  var isCoarse = window.matchMedia &&
                 window.matchMedia('(pointer: coarse)').matches;
  var LOW_END = isSmallViewport || isCoarse ||
                (navigator.hardwareConcurrency || 8) <= 4;

  /* ============================================================
     1. PROCEDURAL TEXTURES
     Every texture is drawn into an off-screen 2D canvas at
     runtime and uploaded as a THREE.CanvasTexture. No image
     asset is fetched or shipped for the 3D scene.
     ============================================================ */

  function hex(c) { return '#' + ('000000' + c.toString(16)).slice(-6); }

  /* --- 1a. building facade: dark glass with lit windows ---
     One texture serves every building; the emissive channel is a
     second canvas holding only the lit windows, so the warm
     window light glows without lifting the whole facade.        */

  function makeFacadeTextures() {
    var W = 128, H = 256;
    var colsPerFace = 8, rowsPerFace = 26;

    var base = document.createElement('canvas');
    base.width = W; base.height = H;
    var b = base.getContext('2d');
    b.fillStyle = '#0D141F';
    b.fillRect(0, 0, W, H);

    var emis = document.createElement('canvas');
    emis.width = W; emis.height = H;
    var e = emis.getContext('2d');
    e.fillStyle = '#000000';
    e.fillRect(0, 0, W, H);

    var padX = 5, padY = 4;
    var cw = (W - padX * (colsPerFace + 1)) / colsPerFace;
    var ch = (H - padY * (rowsPerFace + 1)) / rowsPerFace;

    for (var r = 0; r < rowsPerFace; r++) {
      for (var c = 0; c < colsPerFace; c++) {
        var x = padX + c * (cw + padX);
        var y = padY + r * (ch + padY);

        /* every window has a dark pane in the base map */
        b.fillStyle = '#111C2B';
        b.fillRect(x, y, cw, ch);

        /* about a third are lit, in warm office light; a few in
           the cold "screen glow" of a trading desk               */
        var lit = Math.random();
        if (lit < 0.22) {
          var warmth = 0.62 + Math.random() * 0.38;
          e.fillStyle = 'rgba(227,100,20,' + warmth.toFixed(3) + ')';
          e.fillRect(x, y, cw, ch);
          b.fillStyle = 'rgba(227,100,20,0.22)';
          b.fillRect(x, y, cw, ch);
        } else if (lit < 0.255) {
          e.fillStyle = 'rgba(58,219,118,' + (0.45 + Math.random() * 0.4).toFixed(3) + ')';
          e.fillRect(x, y, cw, ch);
        }
      }
    }

    var baseTex = new THREE.CanvasTexture(base);
    var emisTex = new THREE.CanvasTexture(emis);
    [baseTex, emisTex].forEach(function (t) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.magFilter = THREE.LinearFilter;
      t.minFilter = THREE.LinearMipmapLinearFilter;
    });
    return { base: baseTex, emissive: emisTex };
  }

  /* --- 1b. ground: the market grid the camera moves over --- */

  function makeGroundTexture() {
    var S = 512;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var g = cv.getContext('2d');

    g.fillStyle = '#070B12';
    g.fillRect(0, 0, S, S);

    /* fine grid — the "data" accent, used sparingly */
    g.strokeStyle = 'rgba(58,219,118,0.13)';
    g.lineWidth = 1;
    for (var i = 0; i <= S; i += 32) {
      g.beginPath(); g.moveTo(i + 0.5, 0); g.lineTo(i + 0.5, S); g.stroke();
      g.beginPath(); g.moveTo(0, i + 0.5); g.lineTo(S, i + 0.5); g.stroke();
    }
    /* coarse grid — brighter rules every eighth line */
    g.strokeStyle = 'rgba(58,219,118,0.30)';
    g.lineWidth = 2;
    for (var j = 0; j <= S; j += 256) {
      g.beginPath(); g.moveTo(j, 0); g.lineTo(j, S); g.stroke();
      g.beginPath(); g.moveTo(0, j); g.lineTo(S, j); g.stroke();
    }
    /* a scatter of warm street lamps sitting on the plane */
    for (var k = 0; k < 26; k++) {
      var x = Math.random() * S, y = Math.random() * S;
      var rad = g.createRadialGradient(x, y, 0, x, y, 16 + Math.random() * 20);
      rad.addColorStop(0, 'rgba(227,100,20,0.42)');
      rad.addColorStop(1, 'rgba(227,100,20,0)');
      g.fillStyle = rad;
      g.fillRect(x - 40, y - 40, 80, 80);
    }

    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(14, 14);
    tex.anisotropy = 4;
    return tex;
  }

  /* --- 1c. particle sprite: a soft round mote --- */

  function makeSpriteTexture() {
    var S = 64;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var g = cv.getContext('2d');
    var rad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    rad.addColorStop(0.0, 'rgba(255,255,255,1)');
    rad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    rad.addColorStop(1.0, 'rgba(255,255,255,0)');
    g.fillStyle = rad;
    g.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(cv);
  }

  /* ============================================================
     2. RENDERER, SCENE, CAMERA
     ============================================================ */

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !LOW_END,
      alpha: false,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    bailOut('renderer-failed');
    return;
  }

  var DPR_CAP = LOW_END ? 1.5 : 2;
  var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(C_BG, 1);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(C_BG);
  scene.fog = new THREE.FogExp2(C_BG, 0.0026);

  var camera = new THREE.PerspectiveCamera(
    40, window.innerWidth / window.innerHeight, 0.6, 1600
  );
  camera.position.set(0, 7, 92);

  /* ---------- 2a. ground / data plane ---------- */

  var groundTex = makeGroundTexture();
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1600, 1, 1),
    new THREE.MeshBasicMaterial({ map: groundTex, fog: true })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -150);
  scene.add(ground);

  /* ---------- 2b. skyline ----------
     Every building is one instance of a single unit BoxGeometry
     driven through THREE.InstancedMesh, so the whole financial
     district is a single draw call. Facade + window-light maps
     come from 1a; the per-instance matrix carries the scale, so
     window density stays plausible across very different heights
     because the UVs are repeated per instance below.            */

  var BUILDING_COUNT = LOW_END ? 210 : 430;
  var facade = makeFacadeTextures();

  var boxGeo = new THREE.BoxGeometry(1, 1, 1);
  var buildingMat = new THREE.MeshPhongMaterial({
    color: 0xBFD0E4,
    map: facade.base,
    emissive: 0xffffff,
    emissiveMap: facade.emissive,
    emissiveIntensity: 1.0,
    shininess: 6,
    specular: 0x0E1622
  });

  var buildings = new THREE.InstancedMesh(boxGeo, buildingMat, BUILDING_COUNT);
  buildings.instanceMatrix.setUsage(THREE.StaticDrawUsage);

  var dummy = new THREE.Object3D();
  var placed = 0;
  var guard = 0;
  var towerAnchors = [];       /* remembered for the warm point lights */

  var CORE_Z = -150;                 /* the downtown core sits back here */

  while (placed < BUILDING_COUNT && guard < BUILDING_COUNT * 40) {
    guard++;

    var bx = (Math.random() - 0.5) * 340;
    var bz = -320 + Math.random() * 325;          /* band: z in [-320, 5] */

    /* An avenue runs down the middle of the district toward the
       camera. Without it the street-level opening shot faces a
       wall of glass instead of looking into depth; the avenue is
       wide near the camera and narrows toward the core, which is
       also what gives the opening frame its perspective lines.  */
    var avenue = 40 - Math.max(0, (-bz - 40)) * 0.10;
    if (Math.abs(bx) < Math.max(13, avenue) && bz > -190) { continue; }

    /* keep the plaza the camera opens in genuinely clear */
    var dxc = bx, dzc = bz - 70;
    if (dxc * dxc + dzc * dzc < 62 * 62) { continue; }

    /* Height is driven by distance back from the camera, not only
       by distance from a core point: the foreground stays low-rise
       so sky is visible over it at street level, and the towers
       mass in the middle distance where the fog can work on them.
       A flat random height everywhere just reads as wallpaper.   */
    var depth = Math.max(0, Math.min(1, (10 - bz) / 300));      /* 0 near -> 1 far */
    var lateral = Math.max(0, 1 - Math.abs(bx) / 200);
    var coreDist = Math.sqrt(bx * bx * 0.55 + (bz - CORE_Z) * (bz - CORE_Z));
    var falloff = Math.max(0.10, 1 - coreDist / 300);

    /* foreground cap: nothing near the opening camera may tower */
    var nearCap = 26 + 120 * Math.min(1, Math.max(0, (40 - bz) / 130));

    var h = 12 + Math.pow(Math.random(), 1.9) * 150 *
            falloff * (0.35 + 0.65 * depth) * (0.45 + 0.55 * lateral);
    h = Math.min(h, nearCap);

    var w = 8 + Math.random() * 16;
    var d = 8 + Math.random() * 16;

    dummy.position.set(bx, h / 2, bz);
    dummy.rotation.set(0, (Math.random() - 0.5) * 0.5, 0);
    dummy.scale.set(w, h, d);
    dummy.updateMatrix();
    buildings.setMatrixAt(placed, dummy.matrix);

    if (h > 62 && bz < -80 && towerAnchors.length < 7) {
      towerAnchors.push({ x: bx, y: h, z: bz });
    }
    placed++;
  }
  buildings.count = placed;
  buildings.instanceMatrix.needsUpdate = true;
  buildings.frustumCulled = false;
  scene.add(buildings);

  /* repeat the facade UVs so windows stay roughly window-sized
     no matter how tall the instance was scaled */
  facade.base.repeat.set(2, 7);
  facade.emissive.repeat.set(2, 7);

  /* ---------- 2c. drifting particles ----------
     The reference scene's embers and leaves, reinterpreted as
     ambient market data: sparse, slow, warm-and-cool mixed. They
     are deliberately abstract motes — rendering readable glyphs
     at this scale and distance would be illegible noise.        */

  var P_COUNT = LOW_END ? 700 : 1500;
  var pPos = new Float32Array(P_COUNT * 3);
  var pCol = new Float32Array(P_COUNT * 3);
  var pVel = new Float32Array(P_COUNT);          /* per-mote rise rate */
  var pPhase = new Float32Array(P_COUNT);

  var warmCol = new THREE.Color(C_WARM);
  var mktCol = new THREE.Color(C_MARKET);
  var moonCol = new THREE.Color(C_MOON);

  for (var pi = 0; pi < P_COUNT; pi++) {
    pPos[pi * 3 + 0] = (Math.random() - 0.5) * 460;
    pPos[pi * 3 + 1] = Math.random() * 210;
    pPos[pi * 3 + 2] = -300 + Math.random() * 420;

    var roll = Math.random();
    var col = roll < 0.45 ? warmCol : (roll < 0.72 ? mktCol : moonCol);
    var dim = 0.45 + Math.random() * 0.55;
    pCol[pi * 3 + 0] = col.r * dim;
    pCol[pi * 3 + 1] = col.g * dim;
    pCol[pi * 3 + 2] = col.b * dim;

    pVel[pi] = 0.9 + Math.random() * 2.4;
    pPhase[pi] = Math.random() * Math.PI * 2;
  }

  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

  var points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 1.5,
    map: makeSpriteTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    fog: true
  }));
  points.frustumCulled = false;
  scene.add(points);

  /* ---------- 2d. lighting: one cold source, several warm ---------- */

  scene.add(new THREE.AmbientLight(C_MOON, 0.38));

  /* key: moonlight, high and slightly to camera-left, angled so the
     faces the camera actually sees are the ones that catch it */
  var moon = new THREE.DirectionalLight(C_MOON, 0.70);
  moon.position.set(-90, 215, 170);
  scene.add(moon);

  /* cool fill from camera-right, so the district does not fall into
     an unreadable silhouette on the unlit side */
  var fill = new THREE.DirectionalLight(0x35506E, 0.34);
  fill.position.set(165, 95, 130);
  scene.add(fill);

  /* faint rim from behind the skyline, keeping the far towers
     legible against the fog rather than dissolving into it */
  var rim = new THREE.DirectionalLight(0x2E5A7A, 0.30);
  rim.position.set(70, 70, -280);
  scene.add(rim);

  var warmLights = [];
  var LIGHT_BUDGET = LOW_END ? 2 : 4;
  for (var li = 0; li < Math.min(LIGHT_BUDGET, towerAnchors.length); li++) {
    var a = towerAnchors[li];
    var pl = new THREE.PointLight(C_WARM, 1.5, 190, 2);
    pl.position.set(a.x, a.y * 0.72, a.z);
    scene.add(pl);
    warmLights.push({ light: pl, base: 1.5, phase: Math.random() * Math.PI * 2 });
  }

  /* ============================================================
     3. CAMERA RIG — five waypoints, two CatmullRom splines
     One waypoint per landing-page section, tagged data-cam="N".
     The staging is the curriculum's own arc: the shot opens at
     street level inside the district (Hero, "zero knowledge"),
     and ends high and wide above it (Ledger, the macro view).
     ============================================================ */

  var WAYPOINTS = [
    /* 0 — Hero        : street level, down the avenue, looking up  */
    { position: [   0,   7,  92 ], target: [   0,  46, -120 ], fov: 40 },
    /* 1 — Method      : lifted to a low rooftop, drifting left     */
    { position: [ -38,  30, 128 ], target: [  -6,  52, -130 ], fov: 42 },
    /* 2 — Sources     : above the mid-rises, the district widening */
    { position: [  30,  72, 182 ], target: [   4,  50, -140 ], fov: 44 },
    /* 3 — Curriculum  : clear of every rooftop, whole grid visible */
    { position: [ -22, 132, 258 ], target: [   0,  40, -155 ], fov: 46 },
    /* 4 — Ledger      : the macro view, the floor seen entire      */
    { position: [   6, 178, 318 ], target: [   0,  26, -215 ], fov: 48 }
  ];

  var posCurve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(function (w) { return new THREE.Vector3(w.position[0], w.position[1], w.position[2]); }),
    false, 'catmullrom', 0.35
  );
  var tgtCurve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(function (w) { return new THREE.Vector3(w.target[0], w.target[1], w.target[2]); }),
    false, 'catmullrom', 0.35
  );

  var camSections = [];
  function measureSections() {
    camSections = [];
    var nodes = document.querySelectorAll('[data-cam]');
    Array.prototype.forEach.call(nodes, function (el) {
      var idx = parseInt(el.getAttribute('data-cam'), 10);
      if (isNaN(idx)) return;
      var rect = el.getBoundingClientRect();
      camSections.push({
        index: idx,
        top: rect.top + window.pageYOffset
      });
    });
    camSections.sort(function (a, b) { return a.index - b.index; });
  }

  /* current scroll position expressed as a fractional waypoint index */
  function waypointFraction() {
    var last = WAYPOINTS.length - 1;
    if (camSections.length < 2) { return 0; }

    /* anchor each section a third of a viewport below its own top,
       so a waypoint is "reached" when its section is being read   */
    var y = window.pageYOffset + window.innerHeight * 0.34;

    if (y <= camSections[0].top) { return 0; }
    for (var i = 0; i < camSections.length - 1; i++) {
      var a = camSections[i], b = camSections[i + 1];
      if (y >= a.top && y < b.top) {
        var span = Math.max(1, b.top - a.top);
        var local = (y - a.top) / span;
        return Math.min(last, a.index + local * (b.index - a.index));
      }
    }
    return last;
  }

  /* ---------- pointer parallax, hard-capped ---------- */

  var PARALLAX_MAX = 5.2;                 /* world units, never more */
  var pointerX = 0, pointerY = 0;         /* normalised, [-1, 1]     */
  var parallax = new THREE.Vector3();

  window.addEventListener('mousemove', function (e) {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener('mouseleave', function () {
    pointerX = 0; pointerY = 0;
  });

  /* ============================================================
     4. BLOOM — hand-rolled, restrained
     Bright pass at quarter resolution, three separable blur
     iterations at widening radius, then one additive composite.
     No film grain, no vignette (the page already carries a CSS
     grain layer). Disabled outright on low-end and mobile, and
     switched off at runtime by the watchdog in section 6.
     ============================================================ */

  var bloomEnabled = !LOW_END && window.innerWidth >= 900;

  var FS_VERT = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position.xy, 0.0, 1.0);',
    '}'
  ].join('\n');

  var BRIGHT_FRAG = [
    'uniform sampler2D tDiffuse;',
    'uniform float threshold;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec4 c = texture2D(tDiffuse, vUv);',
    '  float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));',
    '  float k = max(0.0, l - threshold) / max(l, 0.0001);',
    '  gl_FragColor = vec4(c.rgb * k, 1.0);',
    '}'
  ].join('\n');

  var BLUR_FRAG = [
    'uniform sampler2D tDiffuse;',
    'uniform vec2 dir;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec4 s = vec4(0.0);',
    '  s += texture2D(tDiffuse, vUv + dir * -4.0) * 0.0162;',
    '  s += texture2D(tDiffuse, vUv + dir * -3.0) * 0.0540;',
    '  s += texture2D(tDiffuse, vUv + dir * -2.0) * 0.1216;',
    '  s += texture2D(tDiffuse, vUv + dir * -1.0) * 0.1946;',
    '  s += texture2D(tDiffuse, vUv               ) * 0.2270;',
    '  s += texture2D(tDiffuse, vUv + dir *  1.0) * 0.1946;',
    '  s += texture2D(tDiffuse, vUv + dir *  2.0) * 0.1216;',
    '  s += texture2D(tDiffuse, vUv + dir *  3.0) * 0.0540;',
    '  s += texture2D(tDiffuse, vUv + dir *  4.0) * 0.0162;',
    '  gl_FragColor = s;',
    '}'
  ].join('\n');

  var COMPOSITE_FRAG = [
    'uniform sampler2D tBase;',
    'uniform sampler2D tBloom;',
    'uniform float strength;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec4 base = texture2D(tBase, vUv);',
    '  vec4 glow = texture2D(tBloom, vUv);',
    '  gl_FragColor = vec4(base.rgb + glow.rgb * strength, 1.0);',
    '}'
  ].join('\n');

  var fsScene = new THREE.Scene();
  var fsCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
  fsQuad.frustumCulled = false;
  fsScene.add(fsQuad);

  var brightMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, threshold: { value: 0.52 } },
    vertexShader: FS_VERT, fragmentShader: BRIGHT_FRAG, depthTest: false, depthWrite: false
  });
  var blurMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2() } },
    vertexShader: FS_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false
  });
  var compositeMat = new THREE.ShaderMaterial({
    uniforms: {
      tBase: { value: null }, tBloom: { value: null }, strength: { value: 0.78 }
    },
    vertexShader: FS_VERT, fragmentShader: COMPOSITE_FRAG, depthTest: false, depthWrite: false
  });

  var rtScene = null, rtA = null, rtB = null;

  function makeTargets(w, h) {
    [rtScene, rtA, rtB].forEach(function (t) { if (t) t.dispose(); });
    var opts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false
    };
    rtScene = new THREE.WebGLRenderTarget(w, h, opts);
    var qw = Math.max(2, Math.floor(w / 4));
    var qh = Math.max(2, Math.floor(h / 4));
    rtA = new THREE.WebGLRenderTarget(qw, qh, opts);
    rtB = new THREE.WebGLRenderTarget(qw, qh, opts);
  }

  function disposeTargets() {
    [rtScene, rtA, rtB].forEach(function (t) { if (t) t.dispose(); });
    rtScene = rtA = rtB = null;
  }

  function blit(material, target) {
    fsQuad.material = material;
    renderer.setRenderTarget(target || null);
    renderer.render(fsScene, fsCamera);
    renderer.setRenderTarget(null);
  }

  function renderWithBloom() {
    renderer.setRenderTarget(rtScene);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    brightMat.uniforms.tDiffuse.value = rtScene.texture;
    blit(brightMat, rtA);

    var qw = rtA.width, qh = rtA.height;
    var radii = [1.0, 2.0, 3.4];
    for (var i = 0; i < radii.length; i++) {
      blurMat.uniforms.tDiffuse.value = rtA.texture;
      blurMat.uniforms.dir.value.set(radii[i] / qw, 0);
      blit(blurMat, rtB);

      blurMat.uniforms.tDiffuse.value = rtB.texture;
      blurMat.uniforms.dir.value.set(0, radii[i] / qh);
      blit(blurMat, rtA);
    }

    compositeMat.uniforms.tBase.value = rtScene.texture;
    compositeMat.uniforms.tBloom.value = rtA.texture;
    blit(compositeMat, null);
  }

  /* ============================================================
     5. RESIZE + SCROLL
     ============================================================ */

  var needsMeasure = true;

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    if (bloomEnabled) {
      makeTargets(Math.max(2, Math.floor(w * dpr)), Math.max(2, Math.floor(h * dpr)));
    }
    needsMeasure = true;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  window.addEventListener('scroll', function () { /* read in the loop */ }, { passive: true });

  if (bloomEnabled) {
    makeTargets(
      Math.max(2, Math.floor(window.innerWidth * dpr)),
      Math.max(2, Math.floor(window.innerHeight * dpr))
    );
  }
  measureSections();

  /* ============================================================
     6. RENDER LOOP + FPS WATCHDOG
     The watchdog degrades rather than stutters: bloom goes first,
     then pixel ratio, then the particle field thins out. It never
     tears the scene down — that path belongs to the capability
     gate in section 0, which runs before anything is built.
     ============================================================ */

  var camPos = new THREE.Vector3().copy(camera.position);
  var camTgt = new THREE.Vector3(0, 46, -120);
  var wantPos = new THREE.Vector3();
  var wantTgt = new THREE.Vector3();
  var lookAt = new THREE.Vector3();

  var lastT = performance.now();
  var frameAcc = 0, frameCount = 0, degradeStage = 0;
  var elapsed = 0;
  var running = true;

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { lastT = performance.now(); requestAnimationFrame(loop); }
  });

  function loop(now) {
    if (!running) { return; }
    requestAnimationFrame(loop);

    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    elapsed += dt;

    if (needsMeasure) { measureSections(); needsMeasure = false; }

    /* --- camera along the two splines --- */
    var last = WAYPOINTS.length - 1;
    var frac = waypointFraction();
    var u = last > 0 ? frac / last : 0;
    u = Math.max(0, Math.min(1, u));

    posCurve.getPoint(u, wantPos);
    tgtCurve.getPoint(u, wantTgt);

    /* pointer parallax, applied in view space and hard-capped so
       it can never swing the shot off its staged framing */
    parallax.set(pointerX * PARALLAX_MAX, -pointerY * PARALLAX_MAX * 0.55, 0);
    if (parallax.length() > PARALLAX_MAX) { parallax.setLength(PARALLAX_MAX); }
    wantPos.add(parallax);

    /* critically-damped-ish follow, framerate independent */
    var k = 1 - Math.pow(0.0016, dt);
    camPos.lerp(wantPos, k);
    camTgt.lerp(wantTgt, k);

    camera.position.copy(camPos);
    lookAt.copy(camTgt);
    camera.lookAt(lookAt);

    /* fov eased between the same waypoints */
    var fi = Math.min(last, Math.floor(frac));
    var fj = Math.min(last, fi + 1);
    var ft = frac - fi;
    var fov = WAYPOINTS[fi].fov + (WAYPOINTS[fj].fov - WAYPOINTS[fi].fov) * ft;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov += (fov - camera.fov) * k;
      camera.updateProjectionMatrix();
    }

    /* --- particles drift; wrap rather than respawn --- */
    var arr = pGeo.attributes.position.array;
    for (var i = 0; i < P_COUNT; i++) {
      var o = i * 3;
      arr[o + 1] += pVel[i] * dt * 2.2;
      arr[o] += Math.sin(elapsed * 0.32 + pPhase[i]) * dt * 1.7;
      if (arr[o + 1] > 215) {
        arr[o + 1] = -6;
        arr[o] = (Math.random() - 0.5) * 460;
        arr[o + 2] = -300 + Math.random() * 420;
      }
    }
    pGeo.attributes.position.needsUpdate = true;

    /* --- warm window lights breathe, very slightly --- */
    for (var wi = 0; wi < warmLights.length; wi++) {
      var wl = warmLights[wi];
      wl.light.intensity = wl.base * (0.86 + 0.14 * Math.sin(elapsed * 0.7 + wl.phase));
    }

    /* --- draw --- */
    if (bloomEnabled && rtScene) {
      renderWithBloom();
    } else {
      renderer.render(scene, camera);
    }

    /* --- watchdog --- */
    frameAcc += dt * 1000;
    frameCount++;
    if (frameCount >= 90) {
      var avg = frameAcc / frameCount;
      frameAcc = 0; frameCount = 0;

      if (avg > 26 && degradeStage === 0) {
        degradeStage = 1;
        bloomEnabled = false;
        disposeTargets();
      } else if (avg > 32 && degradeStage === 1) {
        degradeStage = 2;
        DPR_CAP = 1;
        renderer.setPixelRatio(1);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
      } else if (avg > 38 && degradeStage === 2) {
        degradeStage = 3;
        pGeo.setDrawRange(0, Math.floor(P_COUNT * 0.4));
      }
    }
  }

  root.setAttribute('data-scene', 'live');
  requestAnimationFrame(loop);

})();
