# Themes engine

Vendored from [scanton/html5-themes](https://github.com/scanton/html5-themes).
These files are copied unmodified so they can be re-synced from upstream — do
not edit them here.

- `engine.js` — WebGL factory and shared GLSL prelude
- `variations/` — 32 background modules (`setup` / `start` / `stop` / `teardown`)
- `sprites/` — 30 sprite effect modules (`init` / `update` / `draw`)
- `compositing.js` — vignette and bloom overlay
- `sprite-engine.js` — Canvas 2D sprite layer

`registry.ts` (one level up) is ours: it maps ids to lazy imports so the editor
only downloads the scene it is showing.
