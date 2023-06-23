import { FastifyPluginAsync } from 'fastify';
import plugins from '../../../plugins';
import { AppRequest } from '../../../lib/types';

export default class MeController {
  constructor() {}

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.register(plugins.requireAuthPlugin);

    fastify.get('/', async (request: AppRequest) => {
      return request.user!;
    });
  };
}
