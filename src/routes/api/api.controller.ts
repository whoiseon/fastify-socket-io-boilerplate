import { FastifyPluginAsync } from 'fastify';
import TestController from './test/test.controller';
import AuthController from './auth/auth.controller';

export default class ApiController {
  private testController = new TestController();
  private authController = new AuthController();

  constructor() {
    console.log('api setting');
  }

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.register(this.testController.routes, { prefix: '/test' });
    fastify.register(this.authController.routes, { prefix: '/auth' });
  };
}
