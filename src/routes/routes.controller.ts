import { FastifyPluginAsync } from 'fastify';
import ApiController from './api/api.controller';
import packageJson from '../lib/packageJson';

export default class RoutesController {
  private apiController = new ApiController();

  constructor() {
    console.log('routes setting');
  }

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.register(this.apiController.routes, { prefix: '/api' });

    fastify.get('/', async () => {
      return {
        version: packageJson.version,
      };
    });
  };
}
