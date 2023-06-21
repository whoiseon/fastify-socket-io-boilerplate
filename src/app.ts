import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastify, { FastifyInstance } from 'fastify';
import RoutesController from './routes/routes.controller';
import fastifySocketIO from 'fastify-socket.io';
import SocketServer from './socket';

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
    console.log('plugins setting');
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
