# 3D model — `loonie_2003.glb`

`loonie.html` loads a real 3D coin and plays the animation baked into the file
(exported from Blender). Nothing is drawn in code — geometry, PBR materials and
the animation clip all live inside the `.glb`. If the file can't be loaded the
page falls back to a plain gold placeholder and shows a notice, so it never
renders blank.

## ► This project uses **Option B** — the model is a GitHub Release asset

The `.glb` is **not** committed to the repo (it's too heavy for GitHub Pages).
`loonie.html` is already pointed at:

```
https://github.com/Kali2007thecodemaster/finance/releases/download/coin-v1/loonie_2003.glb
```

So all you have to do is **attach the file to a release tagged `coin-v1`** — no
code change needed. Steps:

1. On GitHub: **Releases** → **Draft a new release**.
2. **Tag** = `coin-v1` (type it in the tag box and choose "Create new tag"),
   target branch `main`. Give it any title, e.g. "Coin model".
3. Drag **`loonie_2003.glb`** into the **"Attach binaries by dropping them here"**
   box and wait for the upload to finish (Release assets allow up to 2 GB, and
   the web uploader handles large files, so the "too heavy" problem goes away).
4. Click **Publish release**.

Reload `loonie.html` (or the deployed Pages URL) — the coin loads from the
release. Release downloads are served with CORS headers, so the browser fetches
it directly from the Pages origin with no extra config.

> Prefer the CLI? `gh release create coin-v1 loonie_2003.glb --title "Coin model"`

If you ever change the tag or filename, update `MODEL_URL` at the top of the
`<script type="module">` block in `loonie.html` to match.

---

## Why a Release asset and not the repo

GitHub is strict about file size, and a raw Blender export blows past it:

- **100 MB** — hard push limit; a commit containing a bigger file is rejected.
- **50 MB** — GitHub warns above this.
- **Git LFS does _not_ work here.** GitHub Pages serves the *pointer text file*
  for an LFS-tracked binary, not the binary itself — the loader would get a few
  lines of text instead of a model. So **do not** `git lfs track` the `.glb`.

Release assets sidestep all of that: up to **2 GB**, served with CORS, and
nothing lands in the repo or the Pages deploy. That's why this project uses it.

---

## Alternative — commit a *compressed* copy instead

If you'd rather keep the model in the repo, shrink it first with
[`gltf-transform`](https://gltf-transform.dev/) (Node ≥ 18) until it's well
under the size limit, drop it at `models/loonie_2003.glb`, and set `MODEL_URL`
in `loonie.html` back to `'./models/loonie_2003.glb'`.

```bash
npm install -g @gltf-transform/cli

# Draco-compress geometry + resize/re-encode textures
gltf-transform optimize loonie_2003_raw.glb models/loonie_2003.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 2048

ls -lh models/loonie_2003.glb          # aim well under 50 MB
```

Tips if it's still too big: `--texture-size 1024`; `gltf-transform draco in.glb
out.glb -q 10` for tighter quantization; bake to a **single** material/atlas in
Blender; remove unused UV maps / vertex colours / extra scenes before exporting.

> `loonie.html` decodes both Draco- and meshopt-compressed GLBs out of the box —
> the decoders are vendored under `vendor/three/`. No CDN, nothing to configure.

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
