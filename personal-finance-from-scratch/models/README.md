# 3D model — `loonie_2003.glb`

`loonie.html` loads this real 3D coin, orients a face toward the camera and spins
it. Nothing is drawn in code — geometry and PBR materials all live inside the
`.glb`. If the file can't be loaded the page falls back to a plain gold
placeholder and shows a notice, so it never renders blank.

## What's committed here

The `loonie_2003.glb` in this folder is a **compressed** version of the raw
Blender export, served straight from the repo (`MODEL_URL = './models/loonie_2003.glb'`).

| | vertices | size |
|---|---|---|
| Raw export (`Loonie_2003_Baked`) | 8.1 M | **433 MB** |
| Committed here | ~3.2 M | **~21 MB** |

The raw file was far too heavy for GitHub (100 MB hard push limit, 50 MB warning,
and **Git LFS does _not_ work on Pages** — it serves the pointer text, not the
binary). It was shrunk with [`gltf-transform`](https://gltf-transform.dev/) —
mesh-optimizer compression plus a light simplify pass — with **no visible loss**
at web viewing scale:

```bash
npm install -g @gltf-transform/cli
gltf-transform optimize loonie_2003_raw.glb loonie_2003.glb \
  --compress meshopt \
  --simplify true --simplify-ratio 0.4 --simplify-error 0.0005 \
  --texture-compress false
```

> `loonie.html` decodes both **meshopt**- and **Draco**-compressed GLBs out of the
> box — the decoders are vendored under `vendor/three/`. No CDN, nothing to configure.

To re-generate it from a new Blender export, run the command above on your raw
`.glb`. If you want it even smaller, lower `--simplify-ratio` (e.g. `0.25`); to
keep every vertex, drop the two `--simplify*` flags (that gives ~47 MB, still
commitable).

## ⚠ The export had no animation baked in

The supplied GLB contained **zero animation clips**, so `loonie.html` falls back
to spinning the coin on its Y axis (which reads as a coin flip, since a face is
turned toward the camera). If you want the actual Blender animation instead, see
**Getting the animation to play** below and re-export — the page will pick it up
automatically.

## Alternative — host it as a GitHub Release asset instead

If you'd rather not keep the binary in the repo, attach the `.glb` to a release
and point `MODEL_URL` at it (up to 2 GB, served with CORS, nothing in the repo):

1. **Releases → Draft a new release**, tag `coin-v1`, target `main`.
2. Drag `loonie_2003.glb` into **"Attach binaries"**, then **Publish release**.
3. Set `MODEL_URL` in `loonie.html` to
   `https://github.com/Kali2007thecodemaster/finance/releases/download/coin-v1/loonie_2003.glb`.

> CLI: `gh release create coin-v1 loonie_2003.glb --title "Coin model"`

---

## Getting the animation to play

`loonie.html` plays **every** animation clip found in the file via an
`AnimationMixer`. In Blender, before exporting:

- Create an **Action** for the coin (e.g. a full 360° Y rotation over ~200 frames).
- Push it down to an **NLA track** (this is what makes glTF export keep it).
- File → Export → **glTF 2.0 (.glb)**, and under *Animation* tick
  **Animation**, **Include All Actions**, and (if you use NLA) **Group by NLA Track**.

If no clip is present, the page just spins the model slowly on Y so it still
looks alive — and tells you so in the corner notice.
