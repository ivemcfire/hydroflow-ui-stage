import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { FastifyInstance } from 'fastify';

async function dbConnector(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/hydroflow'
    });
}

export default fastifyPlugin(dbConnector);
