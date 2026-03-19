// File: src/backend/server.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/api';
import { initMqtt } from './services/mqttService';

console.log('Starting HydroFlow server initialization...');

const app = express();
const PORT = 3000;
const APP_COLOR = process.env.APP_COLOR || 'blue';

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

async function startServer() {
  console.log('Initializing MQTT...');
  // Initialize MQTT
  initMqtt();

  if (process.env.NODE_ENV === 'production') {
    console.log('Running in PRODUCTION mode');
    const frontendPath = path.join(__dirname, '../../dist/frontend');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.log('Running in DEVELOPMENT mode');
    try {
      const { createServer: createViteServer } = await import('vite');
      console.log('Creating Vite server...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.join(process.cwd(), 'src/frontend'),
      });
      console.log('Vite server created, attaching middlewares...');
      app.use(vite.middlewares);
      
      // Fallback to index.html for SPA routes
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith('/api') || url === '/health') {
          return next();
        }
        try {
          console.log(`Serving SPA route: ${url}`);
          let template = await fs.promises.readFile(
            path.resolve(process.cwd(), 'src/frontend/index.html'),
            'utf-8'
          );
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          console.error('SPA fallback error:', e);
          next(e);
        }
      });
      console.log('Vite middleware and SPA fallback enabled');
    } catch (error) {
      console.error('Failed to initialize Vite server:', error);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[${APP_COLOR.toUpperCase()}] Backend server running on port ${PORT}`);
    console.log(`Access it at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
