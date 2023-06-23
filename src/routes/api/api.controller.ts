import { FastifyPluginAsync } from 'fastify';
import TestController from './test/test.controller';
import AuthController from './auth/auth.controller';
import MeController from './me/me.controller';
import ChatController from './chat/chat.controller';

export default class ApiController {
  private testController = new TestController();
  private authController = new AuthController();
  private meController = new MeController();
  private chatController = new ChatController();

  constructor() {
    console.log('api setting');
  }

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.register(this.testController.routes, { prefix: '/test' });
    fastify.register(this.authController.routes, { prefix: '/auth' });
    fastify.register(this.meController.routes, { prefix: '/me' });
    fastify.register(this.chatController.privateRoutes, { prefix: '/chat' });
    fastify.register(this.chatController.publicRoutes, { prefix: '/chat' });
  };
}
