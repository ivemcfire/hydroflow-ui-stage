# HydroFlow: Intelligent Irrigation System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=flat&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=flat&logo=postgresql&logoColor=white)

HydroFlow is a modern, modular intelligent irrigation dashboard and API designed to actively manage, monitor, and optimize water flow for IoT sensors and hardware arrays. 

## Features

- 🖥️ **Responsive Dashboard**: Beautifully designed UI with real-time insight monitoring, component health checks, and historical graphs.
- 💧 **IoT Ready**: Engineered to control pumps, valves, and read moisture sensors across isolated zones.
- ⚡ **Lightning Fast Backend**: Built with high-performance Fastify API under the `antigravity` service layer.
- 🐳 **K3s / Docker Ready**: Includes multi-stage Dockerfiles designed for lightweight edge Kubernetes deployment.
- 🤖 **AI System Insights**: (Simulated) Intelligent predictive logic to optimize watering schedules based on localized weather trends.

## Tech Stack

**Frontend:**
*   React 19
*   Vite
*   TailwindCSS v4
*   Lucide Icons
*   Recharts (Data Visualization)
*   Framer Motion (Animations)

**Backend:**
*   Fastify
*   Node.js & Express (Vite Middleware)
*   TypeScript
*   PostgreSQL

## Getting Started

### Prerequisites
*   Node.js (v22+)
*   npm or pnpm
*   PostgreSQL database (for the Fastify backend)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ivemcfire/hydroflow-ui-stage.git
    cd hydroflow-ui-stage
    ```

2.  **Install Frontend & Root Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd src/backend/antigravity
    npm install
    ```

4.  **Database Setup:**
    Ensure you have a running PostgreSQL instance. Execute the schema initialization script:
    ```bash
    psql -U your_postgres_user -d your_database -f src/backend/antigravity/schema.sql
    ```

### Running Locally

**Development Mode (HMR Enabled):**
This starts both the Vite dev server and the Express API gateway concurrently on `http://localhost:3000`.

*(Ensure you provide the database connection string if you are testing the backend integration)*
```bash
export DATABASE_URL="postgres://user:password@localhost:5432/hydroflow"
npm run dev
```

**Production Build:**
To compile and serve the optimized application:
```bash
npm run build
npm start
```

## Project Structure

```text
hydroflow-ui-stage/
├── src/
│   ├── frontend/                 # React UI application
│   │   ├── src/pages/            # Dashboard, Login, Hardware, Settings
│   │   ├── src/components/       # Reusable UI widgets
│   │   └── src/context/          # State management (AppContext)
│   └── backend/                  # API and Service Layer
│       ├── server.ts             # Express gateway / static file server
│       └── antigravity/          # Fastify Microservice (IoT Data)
│           ├── src/routes/       # API endpoints (sensors, flowlogs, alerts)
│           └── schema.sql        # Postgres schema definitions
├── dist/                         # Compiled production assets
└── tsconfig.json                 # Project TS configuration
```

## API Endpoints (`/api`)
The new `antigravity` service exposes the following sub-routes (Prefix with `/api` when attached to the main server):

*   **`GET /sensors`**: Retrieve all registered IoT sensors.
*   **`POST /sensors`**: Register a new sensor location.
*   **`GET /flowlogs`**: Retrieve recent water flow metrics.
*   **`POST /flowlogs`**: Log a new flow metric from a sensor.
*   **`GET /alerts`**: Review system anomaly or health alerts.
*   **`POST /alerts`**: Trigger a new system alert.

## Deployment

The application is architected to be deployed either as a standard monolithic Node.js container or split into microservices for K3s. A `Dockerfile` is provided in `src/backend/antigravity` explicitly for containerizing the Fastify API layer.

## License

This project is licensed under the MIT License.
