import { FastifyInstance } from 'fastify';
import { Socket } from 'socket.io';

export default class SocketServer {
  private app;
  private onlineMap: any = {};

  constructor(fastify: FastifyInstance) {
    this.app = fastify;
    console.log('socket server on');
  }

  public start() {
    this.app.io.of(/^\/ws-.+$/).on('connect', (socket) => {
      const newNamespace = socket.nsp; // newNamespace.name === '/dynamic-101
      if (!this.onlineMap[socket.nsp.name]) {
        this.onlineMap[socket.nsp.name] = {};
      }

      // broadcast to all clients in the given sub-namespace
      socket.emit('hello', socket.nsp.name);
      socket.on('join', (id: string) => {
        this.onlineMap[socket.nsp.name][socket.id] = id;
        newNamespace.emit(
          'onlineList',
          Object.values(this.onlineMap[socket.nsp.name]),
        );
        console.log(this.onlineMap);
      });
      socket.on('disconnect', () => {
        setTimeout(() => {
          delete this.onlineMap[socket.nsp.name][socket.id];
          newNamespace.emit(
            'onlineList',
            Object.values(this.onlineMap[socket.nsp.name]),
          );
        }, 1000);
      });
    });

    // this.app.io.on('connect', (socket) => {
    //   console.log('New client connected');

    //   socket.on('chat message', (message: string) => {
    //     console.log('Received message:', message);

    //     // 클라이언트에서 받은 메세지를 다시 클라이언트로 보내기
    //     this.app.io.emit('chat message', message);
    //   });

    //   socket.on('disconnect', () => {
    //     console.log('Client disconnected');
    //   });
    // });
  }
}
