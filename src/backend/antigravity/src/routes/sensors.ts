import { FastifyInstance, FastifyPluginOptions } from 'fastify';

interface SensorBody {
    location: string;
}

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.get('/', async function (request: any, reply: any) {
        const client = await fastify.pg.connect();
        try {
            const { rows } = await client.query('SELECT * FROM Sensors');
            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post<{ Body: SensorBody }>('/', async function (request: any, reply: any) {
        const { location } = request.body;
        const client = await fastify.pg.connect();
        try {
            const { rows } = await client.query(
                'INSERT INTO Sensors (location) VALUES ($1) RETURNING *',
                [location]
            );
            reply.code(201);
            return rows[0];
        } finally {
            client.release();
        }
    });
}
