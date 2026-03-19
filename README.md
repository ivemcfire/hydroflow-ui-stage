# HydroFlow IoT Management System

HydroFlow is a modular, scalable IoT application for managing water pumps, irrigation nodes, automation rules, and monitoring flow rates. Optimized for **homelab deployment**, it features a modern React frontend and a self-contained Node.js backend with SQLite persistence.

## Features
- **Dashboard**: Real-time overview of irrigation nodes, AI insights, weather, and system health.
- **Hardware Management**: Control and monitor pumps, valves, soil sensors, and tank sensors.
- **Zone Control**: Group hardware into logical zones for easier management.
- **Automation Rules**: Create "If This Then That" rules based on sensor readings.
- **Scheduling**: Set up time-based watering schedules.
- **Local Persistence**: Uses SQLite for reliable local data storage without cloud dependencies.
- **Blue-Green Ready**: The UI reads the `APP_COLOR` environment variable to indicate the active deployment environment.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, SQLite (better-sqlite3), WebSockets, MQTT.

## Getting Started (Homelab Deployment)

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Local MQTT Broker (optional, simulation engine included)

### Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your variables (especially `MQTT_BROKER`).
4. Start the application: `npm run dev` (development) or `npm run build && npm start` (production).

## Documentation
- [HANDOFF.md](./HANDOFF.md): Technical details for system maintenance and expansion.
- [PROJECT_MANIFEST.md](./PROJECT_MANIFEST.md): High-level project structure and status.
- [ANTIGRAVITY_EXPORT.md](./ANTIGRAVITY_EXPORT.md): Technical overview for IDE integration.

## Deployment
The application is designed for containerized or bare-metal homelab deployment. It is fully self-contained and does not require external cloud services.
