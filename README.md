# Realistic Controllable Simulation

A 3D simulation of a controllable vehicle with realistic physics.

## Features
- Realistic physics-based movement (acceleration, inertia, friction, braking).
- Interactive 3D environment with shadows and lighting.
- Follow camera for an immersive experience.
- Visual details like rotating wheels and headlights.

## How to Run
1. Start a local web server in the project root:
   ```bash
   python3 -m http.server 4173
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:4173
   ```

## Controls
- **W / Arrow Up**: Accelerate
- **S / Arrow Down**: Reverse / Backwards
- **A / Arrow Left**: Steer Left
- **D / Arrow Right**: Steer Right
- **Space**: Brake
