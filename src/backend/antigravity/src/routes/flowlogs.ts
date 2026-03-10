import { FastifyInstance, FastifyPluginOptions } from 'fastify';

interface FlowLogBody {
    sensor_id: string;
    value: number;
}

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.get('/', async function (request: any, reply: any) {
        const client = await fastify.pg.connect();
        try {
            const { rows } = await client.query('SELECT * FROM FlowLogs');
            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post<{ Body: FlowLogBody }>('/', async function (request: any, reply: any) {
        const { sensor_id, value } = request.body;
        const client = await fastify.pg.connect();
        try {
            const { rows } = await client.query(
                'INSERT INTO FlowLogs (sensor_id, value) VALUES ($1, $2) RETURNING *',
                [sensor_id, value]
            );
            reply.code(201);
            return rows[0];
        } finally {
            client.release();
        }
    });
}
