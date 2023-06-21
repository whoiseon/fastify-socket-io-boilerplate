import { FastifyPluginAsync } from 'fastify';
import TestController from './test/test.controller';

export default class ApiController {
  private testController = new TestController();

  constructor() {
    console.log('api setting');
  }

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.register(this.testController.routes, { prefix: '/test' });
  };
}
