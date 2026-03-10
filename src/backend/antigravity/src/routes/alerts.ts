import { FastifyInstance, FastifyPluginOptions } from 'fastify';

interface AlertBody {
    message: string;
    severity: string;
}

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.get('/', async function (request: any, reply: any) {
        const client = await fastify.pg.connect();
        try {
            const { rows } = await client.query('SELECT * FROM SystemAlerts ORDER BY timestamp DESC');
            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post<{ Body: AlertBody }>('/', async function (request: any, reply: any) {
        const { message, severity } = request.body;
        const client = await fastify.pg.connect();
        try {
            const { rows } = await client.query(
                'INSERT INTO SystemAlerts (message, severity) VALUES ($1, $2) RETURNING *',
                [message, severity]
            );
            reply.code(201);
            return rows[0];
        } finally {
            client.release();
        }
    });
}
