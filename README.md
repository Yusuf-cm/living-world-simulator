# Living World Simulator

A standalone 3D spherical world experiment. **Wild Deck is not modified.**

## Live
https://living-world-simulator.onrender.com

## Current implementation
- True spherical, displaced terrain mesh, not a flat terrain patch or plain colored sphere
- Seeded 3D noise ported from Wild Deck `feature/world-engine-v2`'s `PlanetSurfaceGenerator` (the V2 surface delegates macro relief to this V1 generator)
- Latitude/altitude/moisture biome logic adapted from `PlanetClimateV2`
- Oceans, land elevation, alpine relief, tundra, deserts, forests and rainforests
- Higher-density globe mesh, multi-scale surface relief and biome color variation
- Seeded spatial cloud-opacity texture with weather-band structure, instead of a uniformly opaque shell
- Rotatable globe, zoom, click-to-inspect biome, elevation and baseline climate
- Adjustable time, tilt, warming control (visual UI only for warming), and stylized clouds

## Run
`python -m http.server 8000` then open http://localhost:8000.

## Important limitations
This is an initial *globe viewer*, not the complete Wild Deck simulation. Hydrology classes, rivers, lake geometry, sediment, tectonics, resource layers, live atmospheric physics, fine terrain streaming and surface traversal are **not integrated**. The Java engine is the source of the ported algorithms; this browser build runs its own JavaScript implementation, so exact numerical parity is not yet verified. The globe requires WebGL and may take several seconds to generate. No persistence or backend.

## Source
Wild Deck reference branch: https://github.com/Yusuf-cm/wild-deck/tree/feature/world-engine-v2
