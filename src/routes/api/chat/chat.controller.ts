import { FastifyPluginAsync } from 'fastify';
import plugins from '../../../plugins';
import { AppRequest } from '../../../lib/types';
import ChatService from './chat.service';

export default class ChatController {
  private chatService: ChatService = new ChatService();

  constructor() {}

  public privateRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.register(plugins.requireAuthPlugin);

    fastify.post('/private/message/send', async (request: AppRequest) => {
      const { id: userId } = request.user!;
      const { roomCode, content } = request.body as {
        roomCode: string;
        content: string;
      };

      return this.chatService.createSendMessage({
        userId,
        roomCode,
        content,
      });
    });

    fastify.post('/private/create', async (request: AppRequest) => {
      const { id } = request.user!;

      const { name, description } = request.body as {
        name: string;
        description: string;
      };

      return this.chatService.createRoom({
        userId: id,
        name,
        description,
      });
    });

    fastify.delete('/private/delete/:id', async (request: AppRequest) => {
      const { id: userId } = request.user!;
      const { id: roomId } = request.params as { id: string };

      return this.chatService.deleteRoom({
        userId,
        roomId,
      });
    });
  };

  public publicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/public/message', async (request: AppRequest) => {
      const { roomCode } = request.query as { roomCode: string };

      return this.chatService.getMessages(roomCode);
    });

    fastify.get('/public/room/:code', async (request: AppRequest) => {
      const { code: roomCode } = request.params as { code: string };

      return this.chatService.getRoomUnique(roomCode);
    });

    fastify.get('/public', async (reqest: AppRequest) => {
      return this.chatService.getRooms();
    });
  };
}
