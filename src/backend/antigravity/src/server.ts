// server.ts
import Fastify from 'fastify';
import dbConnector from './plugins/db';
import sensorsRoutes from './routes/sensors';
import flowlogsRoutes from './routes/flowlogs';
import alertsRoutes from './routes/alerts';

const server = Fastify({ logger: true });

// Register Database
server.register(dbConnector);

// Register Routes
server.register(sensorsRoutes, { prefix: '/api/sensors' });
server.register(flowlogsRoutes, { prefix: '/api/flowlogs' });
server.register(alertsRoutes, { prefix: '/api/alerts' });

// Healthcheck
server.get('/health', async (request: any, reply: any) => {
    return { status: 'ok' };
});

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        server.log.info(`Server listening on \${server.addresses()[0]}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
