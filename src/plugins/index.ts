import { FastifyPluginAsync } from 'fastify';
import { AppRequest } from '../lib/types';
import AppError from '../lib/AppError';
import fp from 'fastify-plugin';
import { AccessTokenPayload, validateToken } from '../lib/tokens';
import jwt from 'jsonwebtoken';

const { JsonWebTokenError } = jwt;

class Plugins {
  constructor() {}

  private authPluginAsync: FastifyPluginAsync = async (fastify) => {
    fastify.decorateRequest('user', null);
    fastify.decorateRequest('isExpiredToken', false);
    fastify.addHook('preHandler', async (request: AppRequest) => {
      const token =
        request.cookies.authorization?.split('Bearer ')[1] ??
        request.cookies.access_token;

      if (request.cookies.refresh_token && !token) {
        request.isExpiredToken = true;
        return;
      }

      if (!token) return;

      try {
        const decoded = await validateToken<AccessTokenPayload>(token);

        request.user = {
          id: decoded.userId,
          nickname: decoded.nickname,
          username: decoded.username,
        };
      } catch (e: any) {
        if (e instanceof JsonWebTokenError) {
          console.log(e);
          if (e.name === 'TokenExpiredError') {
            request.isExpiredToken = true;
          }
        }
      }
    });
  };

  public authPlugin = fp(this.authPluginAsync, { name: 'authPlugin' });

  private requireAuthPluginAsync: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('preHandler', async (request: AppRequest) => {
      if (request.isExpiredToken) {
        throw new AppError('Unauthorized', {
          isExpiredToken: true,
        });
      }

      if (!request.user) {
        throw new AppError('Unauthorized', {
          isExpiredToken: false,
        });
      }
    });
  };

  public requireAuthPlugin = fp(this.requireAuthPluginAsync, {
    name: 'requireAuthPlugin',
  });
}

const plugins = new Plugins();

export default plugins;
