# Loonie texture maps

Drop six square images here — the loonie viewer (`../../loonie.html`) loads them
by these exact names:

| File                    | What it is                        | Colour space |
|-------------------------|-----------------------------------|--------------|
| `reverse_color.jpg`     | the loon side (CANADA / DOLLAR)   | sRGB         |
| `reverse_normal.jpg`    | tangent-space normal for the loon | linear       |
| `reverse_roughness.jpg` | roughness for the loon side       | linear       |
| `obverse_color.jpg`     | the Queen side (ELIZABETH II)     | sRGB         |
| `obverse_normal.jpg`    | tangent-space normal for the Queen| linear       |
| `obverse_roughness.jpg` | roughness for the Queen side      | linear       |

Guidance for clean results:
- **Square** crop, coin **centred and filling the frame** (the round cap only
  samples the inscribed disc, so the square corners never show — but any grey
  background *inside* the coin's rim will, so crop tight to the coin edge).
- The colour map reads best **flat-lit** (an evenly-lit scan), because the
  scene adds its own lighting; a photo with strong baked highlights will
  double up. A desaturated near-white map works well for a silver-nickel look;
  leave it as-is for the plated-gold look.
- The **normal map** is the blue/violet one — it carries the relief.
- Roughness: darker = shinier (mirror fields), lighter = matte (frosted
  devices). If you don't have a roughness map, a mid-grey fill is fine.

If a face lands sideways once real images are in, adjust `rot` / `flipX` in
`loonie.html`'s `faceTexture()` calls.
