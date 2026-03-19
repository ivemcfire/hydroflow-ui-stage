# HydroFlow - Technical Handoff

This document provides technical details for the **HydroFlow** full-stack IoT system, optimized for homelab deployment.

## 1. Project Overview
**HydroFlow** is a self-contained IoT dashboard and control system. It manages irrigation nodes, hardware components (pumps, valves, sensors), and automation rules.

The system is designed for local network deployment, removing all external cloud dependencies (Firebase) in favor of local SQLite persistence.

## 2. Backend Architecture
The backend is a Node.js/Express server that serves as the central hub for the system.

- **Server Entry**: `src/backend/server.ts`
- **Database**: SQLite (`hydroflow.db`) managed via `better-sqlite3`.
- **Persistence Layer**: `src/backend/database.ts` (schema) and `src/backend/localDb.ts` (CRUD operations).
- **IoT Integration**: 
    - **MQTT Service**: `src/backend/services/mqttService.ts` handles communication with the MQTT broker.
    - **Simulation Engine**: `src/backend/services/simulationService.ts` generates mock telemetry when real hardware is not connected.
- **Real-time Data**: WebSockets are used to stream live telemetry and status updates to the frontend.

### API Endpoints (Base URL: `/api`)
- `GET /api/status`: System health and environment info.
- `GET /api/nodes`: List of all irrigation nodes.
- `POST /api/nodes`: Create a new node.
- `PUT /api/nodes/:id`: Update node details.
- `DELETE /api/nodes/:id`: Delete a node.
- `GET /api/hardware`: List of all hardware components.
- `POST /api/pumps/:id/toggle`: Toggle pump/valve status.
- `GET /api/automations`: List of automation rules.
- `GET /api/activity`: Recent system logs.
- `GET /api/alerts`: System notifications.

## 3. Frontend Architecture
The frontend is a React 18 Single Page Application (SPA) built with Vite and Tailwind CSS.

- **State Management**: React Context (`AppContext.tsx`) handles global state.
- **API Service**: `src/frontend/src/services/api.ts` manages communication with the backend.
- **Real-time Updates**: The UI updates reactively via WebSockets and regular polling for critical status.
- **User Management**: Removed for homelab simplicity. The system assumes a trusted local network environment.

## 4. Deployment (Homelab)
- **Environment Variables**: See `.env.example`.
    - `MQTT_BROKER`: URL of the local MQTT broker (e.g., `mqtt://localhost:1883`).
    - `APP_COLOR`: Deployment environment indicator (Blue/Green).
- **Build & Start**:
    - `npm install`: Install dependencies.
    - `npm run build`: Build the frontend and backend.
    - `npm start`: Start the production server on port 3000.

## 5. Maintenance & Expansion
- **Database Schema**: To modify the database, update `src/backend/database.ts` and run a migration script or recreate the database.
- **New Hardware**: Add new hardware types in the backend controllers and update the frontend `HardwareIcon.tsx` for visual representation.
- **AI Insights**: The system is ready for Gemini API integration to analyze historical logs stored in SQLite.
