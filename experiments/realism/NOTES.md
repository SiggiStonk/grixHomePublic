# Realism study v1

Built-in image generation was used to edit each original embedded PDF perspective. The entrance study provides a shared material/lighting reference for the other two perspectives.

## Scope

- Preserve the planned architecture and composition as closely as possible.
- Improve plaster, clay tiles, glazing, vegetation, paving and daylight realism.
- Keep original facade/roof colors so this remains a material-and-light comparison.
- Keep the three original `site/assets/*.jpg` files and all existing recoloring masks unchanged.

## Review and limitations

The enhanced images are aesthetic studies, not geometrically exact substitutes or approved building plans. AI edits change fine details, reflections, vegetation, people and edge positions. The entrance image also introduces a chimney cap. Check all architectural details against the original PDF before treating any generated feature as intentional.

The output resolutions differ from the source image resolutions. Even with matching aspect ratios, resizing alone does not guarantee mask alignment. Promoting an image into the color studio requires retracing or registering the masks and recalibrating the wall illumination reference; direct replacement would reintroduce the artifacts already fixed in the baseline.

No generated perspective is used by the main color picker in this experiment. Open this directory's `index.html` through the local server to compare originals and enhanced versions.

## Saved state

`baseline/color-studio-v8` points to the approved original website at `9fecbc9208dc4f73bb91ba459da503e76d7219ca`. This study is maintained on `experiment/realistic-perspectives`.

The exact generation instructions are recorded in `prompts.json` alongside the study images. These assets were generated using the built-in image tool, not the fallback API/CLI.
