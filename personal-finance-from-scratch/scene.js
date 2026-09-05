/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — scene.js  (ESM)

   The landing hero coin: the REAL Canadian loonie GLB model
   (models/loonie_2003.glb, the same asset the standalone viewer
   loonie.html renders), tumbling end-over-end down the right
   margin as the page scrolls. This fuses the viewer's model into
   the landing — the procedural coin that used to live here is
   gone.

   Rendering follows the viewer: GLTFLoader (Draco + meshopt
   ready, decoders vendored locally), a procedural RoomEnvironment
   pushed through PMREM for the metal reflections, a small direct
   light rig for moving speculars, sRGB + ACES output. Everything
   else — the scroll waypoints, the flip, the responsive framing,
   the pointer parallax, the theme reaction and the graceful
   fallbacks — is carried over unchanged from the original scene.

   This file runs on index.html ONLY, as a module. The reader
   pages load neither three.js nor this file, deliberately.
   ============================================================ */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/meshopt_decoder.module.js';

(function () {
  'use strict';

  var root = document.documentElement;
  var canvas = document.getElementById('scene-canvas');
  if (!canvas) { return; }

  var MODEL_URL = './models/loonie_2003.glb';
  var TAU = Math.PI * 2;

  function bailOut(reason) {
    root.setAttribute('data-scene', 'fallback');
    root.setAttribute('data-scene-reason', reason);
  }

  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* WebGL support probe — fall back to the CSS minted disc if absent */
  var probeOk = false;
  try {
    var probe = document.createElement('canvas');
    probeOk = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch (err) { probeOk = false; }
  if (!probeOk) { bailOut('no-webgl'); return; }

  /* show the CSS disc as a placeholder while the 3D model downloads */
  bailOut('loading');

  var isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var LOW_END = window.innerWidth < 820 || isCoarse ||
                (navigator.hardwareConcurrency || 8) <= 4;

  /* ============================================================
     1. RENDERER / SCENE / CAMERA
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

  /* ============================================================
     2. ENVIRONMENT + LIGHTS
     A neutral studio (RoomEnvironment) through PMREM does the bulk
     of the metal reflection; a small direct rig adds the moving
     specular the env map cannot give.
     ============================================================ */

  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  var key = new THREE.DirectionalLight(0xfff2dc, 2.35);
  key.position.set(-3.2, 4.0, 5.0);
  scene.add(key);

  var fill = new THREE.DirectionalLight(0xd6deec, 0.55);
  fill.position.set(4.0, -2.2, 3.0);
  scene.add(fill);

  /* rim in the page's pink accent — grazes the top edge */
  var rim = new THREE.DirectionalLight(0xcd8dbd, 1.8);
  rim.position.set(1.4, 2.4, -4.5);
  scene.add(rim);

  var rim2 = new THREE.DirectionalLight(0xffe0b0, 0.9);
  rim2.position.set(-2.2, -2.6, -3.5);
  scene.add(rim2);

  function readTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  /* per-theme exposure, rim balance and reflection strength */
  var coinMats = [];   /* populated once the model has loaded */
  function applyThemeLook(theme) {
    var lightT = theme === 'light';
    if (lightT) {
      renderer.toneMappingExposure = 0.78;
      key.intensity = 1.7;
      fill.intensity = 0.3;
      rim.intensity = 0.9;
      rim2.intensity = 0.45;
    } else {
      renderer.toneMappingExposure = 0.84;
      key.intensity = 1.25;
      fill.intensity = 0.3;
      rim.intensity = 0.75;
      rim2.intensity = 0.4;
    }
    for (var i = 0; i < coinMats.length; i++) {
      var base = coinMats[i].userData.emi || 0.68;
      coinMats[i].envMapIntensity = base * (lightT ? 0.55 : 1);
    }
  }
  applyThemeLook(readTheme());

  window.addEventListener('themechange', function (e) {
    var t = (e && e.detail && e.detail.theme) === 'light' ? 'light' : 'dark';
    applyThemeLook(t);
    try { renderer.render(scene, camera); } catch (err) { /* not ready yet */ }
  });

  /* ============================================================
     3. THE COIN — real GLB model
     coinGroup   : positioned + scaled by the scroll stager
       coin      : a plain pivot that receives the tumbling rotation
         model   : the loaded GLB, oriented so a face points at the
                   camera and centred on the pivot
     ============================================================ */

  var coinGroup = new THREE.Group();
  var coin = new THREE.Group();
  coinGroup.add(coin);
  scene.add(coinGroup);

  var modelReady = false;

  /* Orient a flat-disc model so its thin (face-normal) axis points +Z
     toward the camera, centre it on the origin, and scale its largest
     dimension to `target` world units — matching the old coin's 2.0
     diameter so the scroll waypoints need no retuning. */
  function frameModel(obj, target) {
    var box = new THREE.Box3().setFromObject(obj);
    var size = box.getSize(new THREE.Vector3());
    var dims = [['x', size.x], ['y', size.y], ['z', size.z]].sort(function (a, b) { return a[1] - b[1]; });
    var thin = dims[0][0];
    if (thin === 'y') obj.rotation.x = Math.PI / 2;
    else if (thin === 'x') obj.rotation.y = Math.PI / 2;

    box = new THREE.Box3().setFromObject(obj);
    var size2 = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var maxDim = Math.max(size2.x, size2.y, size2.z) || 1;
    var s = target / maxDim;
    obj.scale.setScalar(s);
    obj.position.sub(center.multiplyScalar(s));
  }

  var draco = new DRACOLoader();
  draco.setDecoderPath('./vendor/three/draco/');
  var gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);

  gltfLoader.load(
    MODEL_URL,
    function (gltf) {
      var model = gltf.scene || gltf.scenes[0];
      model.traverse(function (o) {
        if (o.isMesh && o.material) {
          var mats = Array.isArray(o.material) ? o.material : [o.material];
          for (var k = 0; k < mats.length; k++) {
            var m = mats[k];
            if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; if ('encoding' in m.map) m.map.encoding = THREE.sRGBEncoding; }
            /* the raw model reflected the studio like a mirror and washed out
               to near-white — dial the metal back to a satin, deeper gold:
               far less environment reflection, a roughness floor so the
               reflection is diffuse rather than a hard specular, a slightly
               softened metalness, and a deepened base colour so it reads as
               gold rather than pale cream. */
            if (m.userData.emi === undefined) m.userData.emi = 0.68;
            m.envMapIntensity = 0.68;
            if (typeof m.roughness === 'number') m.roughness = Math.min(1, Math.max(m.roughness, 0.52));
            if (typeof m.metalness === 'number') m.metalness = Math.min(m.metalness, 0.86);
            if (m.color && m.color.multiplyScalar) m.color.multiplyScalar(0.8);
            m.needsUpdate = true;
            coinMats.push(m);
          }
        }
      });
      frameModel(model, 2.0);
      coin.add(model);
      applyThemeLook(readTheme());
      modelReady = true;
      start();
    },
    undefined,
    function () { bailOut('model-failed'); }
  );

  /* ============================================================
     4. SCROLL STAGING  (carried over from the original scene)
     ============================================================ */

  var WAYPOINTS = [
    { x:  1.95, y:  0.06, scale: 1.06 },   /* 0 hero       */
    { x:  2.14, y:  0.62, scale: 0.50 },   /* 1 method     */
    { x:  2.22, y: -0.30, scale: 0.46 },   /* 2 sources    */
    { x:  2.20, y:  0.50, scale: 0.44 },   /* 3 curriculum */
    { x:  1.62, y:  0.42, scale: 0.72 }    /* 4 ledger — raised so the whole coin clears the footer */
  ];

  var FLIPS = 4;

  var posCurve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(function (w) { return new THREE.Vector3(w.x, w.y, 0); }),
    false, 'catmullrom', 0.4
  );

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

  function pageProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.max(0, Math.min(1, window.pageYOffset / max)) : 0;
  }

  function responsive() {
    var aspect = window.innerWidth / window.innerHeight;
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
    if (modelReady && REDUCED_MOTION) { measureSections(); stage(false, 0); renderer.render(scene, camera); }
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  /* ============================================================
     5. RENDER
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

  /* started once the model has loaded */
  function start() {
    root.removeAttribute('data-scene-reason');
    root.setAttribute('data-scene', 'live');
    measureSections();

    if (REDUCED_MOTION) {
      root.setAttribute('data-scene-motion', 'static');
      stage(false, 0);
      renderer.render(scene, camera);
      return;
    }

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) { lastT = performance.now(); requestAnimationFrame(loop); }
    });

    lastT = performance.now();
    requestAnimationFrame(loop);
  }

})();
