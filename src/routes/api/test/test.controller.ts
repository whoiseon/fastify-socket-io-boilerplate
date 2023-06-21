import { FastifyPluginAsync } from 'fastify';

export default class TestController {
  constructor() {
    console.log('test setting');
  }

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async () => {
      return {
        test: 'test',
      };
    });

    fastify.get('/ping', async () => {
      return {
        message: 'pong',
      };
    });
  };
}
