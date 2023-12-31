import { FastifyRequest } from 'fastify';

export interface AppRequest extends FastifyRequest {
  user?: {
    id: number;
    nickname: string;
    username: string;
  };
  isExpiredToken?: boolean;
}

export interface RequestUser {
  id: number;
  nickname: string;
  username: string;
}
