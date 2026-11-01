# Living World Simulator

An independent, browser-based 3D terrain sandbox (not Wild Deck).

## Live site
https://living-world-simulator.onrender.com

## Features
- Seed-based, procedurally generated 3D terrain with mountains, valleys, islands, beaches and water
- Forest meshes distributed according to elevation
- Orbit camera and WASD/Q/E fly navigation
- Adjustable simulated day/night speed, seasons and solar position
- Moving stylized clouds, storm activity, climate warming slider
- Terrain inspection showing estimated elevation, temperature and humidity

## Controls
Drag: orbit camera. Mouse wheel: zoom. WASD: fly. Q/E: descend/ascend. Shift: faster movement. Click terrain: inspect. Change seed and press Generate world for new geography.

## Local development
```bash
python -m http.server 8000
```
Open http://localhost:8000. Internet is required for the Three.js CDN.

## Current limitations
The terrain is a finite heightfield, not a complete spherical planet. Units are illustrative. Climate is heuristic; cloud movement is visual rather than a fluid-dynamics simulation. No river hydrology, persistence, weather-driven terrain changes, or collision-aware character controller yet. A browser GPU is required.

Render hosts the static site and automatically redeploys on main branch updates.
