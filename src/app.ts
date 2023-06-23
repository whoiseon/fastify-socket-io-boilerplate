import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastify, { FastifyInstance } from 'fastify';
import RoutesController from './routes/routes.controller';
import fastifySocketIO from 'fastify-socket.io';
import SocketServer from './socket';
import 'dotenv/config';
import { isAppError } from './lib/AppError';
import plugins from './plugins';

class Server {
  private app: FastifyInstance;
  private socketServer: SocketServer;
  private routesController: RoutesController = new RoutesController();

  constructor() {
    this.app = fastify({ logger: true });
    this.socketServer = new SocketServer(this.app);

    this.setMiddlewares();
    this.start(3060);
    this.setPlugins();
    this.setRoutes();
    this.startApp();
  }

  private setMiddlewares() {
    console.log('registered');

    // cors 설정
    this.app.register(fastifyCors, {
      origin: '*',
      credentials: true,
    });

    // cookie 설정
    this.app.register(fastifyCookie);

    // socket.io 설정
    this.app.register(fastifySocketIO);

    // Error Handler 설정
    this.app.setErrorHandler(async (error, request, reply) => {
      reply.statusCode = error.statusCode ?? 500;
      if (isAppError(error)) {
        return {
          name: error.name,
          message: error.message,
          statusCode: error.statusCode,
          payload: error.payload,
        };
      }

      if (error.statusCode === 400) {
        return {
          name: 'BadRequest',
          message: error.message,
          statusCode: 400,
        };
      }

      return error;
    });
  }

  public start(port: number) {
    this.app.listen({ port }, (error, adderss) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }

      console.log(`server listening on ${adderss}`);
    });
  }

  private setPlugins() {
    this.app.register(plugins.authPlugin);
  }

  private setRoutes() {
    this.app.register(this.routesController.routes);
  }

  private startApp() {
    this.app.ready((err) => {
      if (err) throw err;

      this.socketServer.start();
    });
  }
}

const server = new Server();
