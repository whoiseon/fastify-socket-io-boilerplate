import AppError from '../../../lib/AppError';
import db from '../../../lib/database';
import { generateUUID } from '../../../lib/uuid';
import {
  CreateRoomParams,
  CreateSendMessageParams,
  RoomDeleteParams,
} from './chat.types';

export default class ChatService {
  constructor() {}

  public createSendMessage = async ({
    userId,
    roomCode,
    content,
  }: CreateSendMessageParams) => {
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
  };

  public createRoom = async ({
    userId,
    name,
    description,
  }: CreateRoomParams) => {
    try {
      const newRoom = await db.room.create({
        data: {
          manager: {
            connect: {
              id: userId,
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
  };

  public deleteRoom = async ({ roomId, userId }: RoomDeleteParams) => {
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
  };

  public getMessages = async (roomCode: string) => {
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
  };

  public getRooms = async () => {
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
  };

  public getRoomUnique = async (roomCode: string) => {
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
  };
}
