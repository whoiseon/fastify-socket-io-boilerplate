import { FastifyInstance } from 'fastify';

export default class SocketServer {
  private app;

  constructor(fastify: FastifyInstance) {
    this.app = fastify;
    console.log('socket server on');
  }

  public start() {
    this.app.io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('chat message', (message: string) => {
        console.log('Received message:', message);

        // 클라이언트에서 받은 메세지를 다시 클리언트로 보내기
        this.app.io.emit('chat message', message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}
