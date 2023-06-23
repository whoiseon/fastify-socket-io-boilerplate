import { FastifyPluginAsync } from 'fastify';
import plugins from '../../../plugins';
import { AppRequest } from '../../../lib/types';
import db from '../../../lib/database';
import { RoomDeleteParams } from './chat.types';
import AppError from '../../../lib/AppError';
import { generateUUID } from '../../../lib/uuid';

export default class ChatController {
  constructor() {}

  public privateRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.register(plugins.requireAuthPlugin);

    fastify.post('/private/message/send', async (request: AppRequest) => {
      const { id: userId } = request.user!;
      const { roomCode, content } = request.body as {
        roomCode: string;
        content: string;
      };

      try {
        const room = await db.room.findUnique({
          where: {
            code: roomCode,
          },
        });

        if (!room) {
          throw new AppError('NotFound');
        }

        const newMessage = await db.message.create({
          data: {
            content,
            roomCode,
            userId,
          },
        });

        return {
          error: '',
          success: true,
          data: newMessage,
        };
      } catch (e: any) {
        return {
          error: e.message,
          success: false,
          data: {},
        };
      }
    });

    fastify.post('/private/create', async (request: AppRequest) => {
      const { id } = request.user!;

      const { name, description } = request.body as {
        name: string;
        description: string;
      };

      try {
        const newRoom = await db.room.create({
          data: {
            manager: {
              connect: {
                id,
              },
            },
            name,
            code: generateUUID(6),
            description,
            isPrivate: false,
          },
        });

        return {
          error: '',
          success: true,
          data: newRoom,
        };
      } catch (e: any) {
        return {
          error: e.message,
          success: false,
          data: null,
        };
      }
    });

    fastify.delete('/private/delete/:id', async (request: AppRequest) => {
      const { id: userId } = request.user!;
      const { id: roomId } = request.params as RoomDeleteParams;

      try {
        const room = await db.room.findUnique({
          where: {
            id: Number(roomId),
          },
        });

        if (!room) {
          throw new AppError('NotFound');
        }

        if (room.managerId !== userId) {
          throw new AppError('Forbidden');
        }

        await db.room.delete({
          where: {
            id: Number(roomId),
          },
        });

        return {
          error: '',
          success: true,
        };
      } catch (e: any) {
        return {
          error: e.message,
          success: false,
        };
      }
    });
  };

  public publicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/public/message', async (request: AppRequest) => {
      const { roomCode } = request.query as { roomCode: string };
      try {
        const messages = await db.message.findMany({
          where: {
            roomCode,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
              },
            },
          },
        });

        return {
          error: '',
          totalCount: messages.length,
          data: messages,
        };
      } catch (e: any) {
        return {
          error: e.message,
          totalCount: 0,
          data: [],
        };
      }
    });

    fastify.get('/public/room/:code', async (request: AppRequest) => {
      const { code: roomCode } = request.params as { code: string };

      try {
        const room = await db.room.findUnique({
          where: {
            code: roomCode,
          },
          include: {
            manager: {
              select: {
                id: true,
                username: true,
                nickname: true,
              },
            },
          },
        });

        if (!room) {
          throw new AppError('NotFound');
        }

        return {
          error: '',
          data: room,
        };
      } catch (e: any) {
        return {
          error: e.message,
          data: null,
        };
      }
    });

    fastify.get('/public', async (reqest: AppRequest) => {
      try {
        const rooms = await db.room.findMany();

        return {
          error: '',
          totalCount: rooms.length,
          data: rooms,
        };
      } catch (e: any) {
        return {
          error: e.message,
          totalCount: 0,
          data: [],
        };
      }
    });
  };
}
