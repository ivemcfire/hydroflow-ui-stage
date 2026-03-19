# HydroFlow Technical Export for Antigravity IDE

This document provides a comprehensive technical overview of the **HydroFlow** project for continued development within the Antigravity IDE.

## 1. Project Architecture
HydroFlow is a full-stack IoT application utilizing a **React** frontend and a **Node.js/Express** backend, integrated with **SQLite** and **MQTT**.

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, better-sqlite3.
- **Database**: SQLite (Local persistence).
- **IoT Protocol**: MQTT (via `mqtt.js`) for hardware communication.
- **Real-time**: WebSockets for live telemetry and status updates.

## 2. Core Components & Services

### Backend Services (`/src/backend/`)
- **Database Logic**: `database.ts` (Schema) and `localDb.ts` (CRUD operations).
- **MQTT Service**: `services/mqttService.ts` manages connections to the MQTT broker, subscribes to sensor topics, and publishes control commands.
- **Simulation Engine**: `services/simulationService.ts` is a server-side loop that simulates environmental data (Soil Moisture, Tank Levels) and publishes to MQTT.

### Frontend Architecture (`/src/frontend/`)
- **AppContext**: `src/context/AppContext.tsx` handles centralized state management for system health, hardware, and telemetry.
- **API Service**: `src/services/api.ts` is the REST client for interacting with the Express backend.
- **Real-time Listeners**: WebSocket integration in the frontend for live UI updates.

## 3. Data Schema (SQLite)
The database structure is managed in `src/backend/database.ts`. Key tables include:
- `nodes`: Irrigation hardware nodes.
- `hardware`: Actuators (pumps/valves) and sensors.
- `telemetry`: Historical telemetry data.
- `automations`: User-defined rules.
- `logs`: System activity and alerts.

## 4. Environment & Configuration
- **Environment Variables**: Defined in `.env.example`.
    - `APP_COLOR`: Used for Blue-Green deployment signaling.
    - `MQTT_BROKER`: URL for the local MQTT broker.
- **Persistence**: The SQLite database is stored in `hydroflow.db` in the root directory.

## 5. Development Workflow in Antigravity
- **Build**: `npm run build` compiles both frontend and backend.
- **Dev**: `npm run dev` starts the Express server with Vite middleware.
- **Verification**: Use `lint_applet` and `compile_applet` to ensure code quality.

## 6. Pending Development Tasks
1.  **AI Insights**: Integrate Gemini API to analyze historical telemetry and provide predictive maintenance alerts.
2.  **Automation Engine**: Enhance server-side logic to process complex multi-step automation sequences.
3.  **Mobile Optimization**: Refine Tailwind layouts for specialized field-tablet views.

## 7. Critical Implementation Notes
- **MQTT Topics**: Sensors publish to `hydroflow/sensors/{nodeId}/{sensorType}`. Controls listen on `hydroflow/control/{nodeId}/{componentId}`.
- **Simulation**: The simulation engine is active by default in the dev server. It can be toggled via environment variables if a real MQTT broker is connected.
- **Blue-Green Banner**: Ensure the `APP_COLOR` logic in the header is preserved during UI refactors.
- **User Management**: Removed for homelab simplicity. The system assumes a trusted local network environment.
