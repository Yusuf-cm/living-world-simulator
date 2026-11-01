# Living World Simulator

Standalone interactive 3D planet sandbox, separate from Wild Deck.

## Features
- Orbit and zoom a 3D planet
- Adjustable day/night time simulation
- Axial tilt and seasons
- Latitude-based temperature estimates and warming offset
- Moving cloud shell and stylized storms
- Click regions to inspect simulated climate

## Run
Serve this folder with `python -m http.server 8000` and visit http://localhost:8000. Internet required for Three.js CDN.

## Planet mesh
The original procedural planet mesh is not yet committed. To use it, add the previously downloaded `procedural_world_terrain.glb` as `assets/planet.glb`. Until then, the viewer displays a fallback sphere.

## Limitations
Weather is illustrative, not fluid dynamics. No hydrology, precipitation accumulation, erosion, or persistence.
