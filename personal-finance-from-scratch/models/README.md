# 3D model — `loonie_2003.glb`

`loonie.html` loads a real 3D coin from this folder and plays the animation
baked into the file (exported from Blender). The page expects:

```
personal-finance-from-scratch/models/loonie_2003.glb
```

Nothing is drawn in code — geometry, PBR materials and the animation clip all
live inside the `.glb`. If the file is missing the page falls back to a plain
gold placeholder and shows a notice, so it never renders blank.

---

## The catch: GitHub Pages + big files

Your export is **too heavy**, and GitHub is strict about size:

- **100 MB** — hard limit; a push containing a bigger file is rejected outright.
- **50 MB** — GitHub warns above this.
- **Git LFS does _not_ work here.** GitHub Pages serves the *pointer text file*
  for an LFS-tracked binary, not the binary itself — the loader would get a few
  lines of text instead of a model. So **do not** `git lfs track` the `.glb`.

You therefore have two good options. Pick one.

---

## Option A — compress the GLB and commit it (recommended if you can get under ~40 MB)

Use [`gltf-transform`](https://gltf-transform.dev/) (Node ≥ 18). It shrinks a
Blender export dramatically by Draco/meshopt-compressing the mesh and resizing
textures — both of which `loonie.html` already knows how to decode locally.

```bash
# one-time install
npm install -g @gltf-transform/cli

# from the personal-finance-from-scratch/ folder, with your raw export as input:
#   1) Draco-compress geometry, 2) resize textures to 2K, 3) WebP-encode them
gltf-transform optimize loonie_2003_raw.glb models/loonie_2003.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 2048
```

Check the result and, if it's comfortably under the limit, commit it:

```bash
ls -lh models/loonie_2003.glb          # aim well under 50 MB
git add models/loonie_2003.glb
git commit -m "Add compressed loonie GLB model"
git push -u origin claude/personal-finance-from-scratch-3banuv
```

Tips if it's still too big:

- `--texture-size 1024` — 1K textures are plenty for a spinning coin.
- `gltf-transform draco loonie.glb out.glb -q 10` — tighter quantization.
- Bake to a **single** material/atlas in Blender before exporting.
- Remove unused UV maps / vertex colours / extra scenes in Blender.

> `loonie.html` handles both Draco and meshopt compression out of the box — the
> decoders are vendored under `vendor/three/`. No CDN, nothing to configure.

---

## Option B — host the heavy GLB as a GitHub Release asset (no size wrangling)

Release assets allow files up to **2 GB** and are served with proper CORS, so
the browser can fetch them directly. The `.glb` stays out of the repo entirely.

1. **Create a release** (GitHub → *Releases* → *Draft a new release*), tag it
   e.g. `coin-v1`, and **drag `loonie_2003.glb` into the "Attach binaries" box**.
   Publish the release.

2. **Copy the asset URL.** It looks like:

   ```
   https://github.com/Kali2007thecodemaster/finance/releases/download/coin-v1/loonie_2003.glb
   ```

3. **Point the page at it.** In `loonie.html`, set:

   ```js
   const MODEL_URL = 'https://github.com/Kali2007thecodemaster/finance/releases/download/coin-v1/loonie_2003.glb';
   ```

   Commit that one-line change and push. Done — the model loads from the
   release, and the repo (and Pages deploy) stays small.

> Uploading via the CLI instead of the web UI: with the `gh` tool,
> `gh release create coin-v1 loonie_2003.glb --title "Coin model"`.

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
