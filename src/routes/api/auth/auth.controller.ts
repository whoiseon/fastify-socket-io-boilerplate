import { FastifyPluginAsync } from 'fastify';
import AuthService from './auth.service';
import {
  AuthResult,
  RefreshBody,
  SignInParams,
  SignUpParams,
  UserResult,
} from './auth.types';
import { setTokenCookie } from '../../../lib/cookies';
import { AppRequest } from '../../../lib/types';

export default class AuthController {
  private authService = new AuthService();

  constructor() {}

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/signup', async (request: AppRequest, reply) => {
      const authResult = await this.authService.signup(
        request.body as SignUpParams,
      );
      return authResult;
    });

    fastify.post('/signin', async (request: AppRequest, reply) => {
      const authResult: AuthResult = await this.authService.signin(
        request.body as SignInParams,
      );
      setTokenCookie(reply, authResult.tokens);
      return authResult;
    });

    fastify.post('/signout', async (request: AppRequest, reply) => {
      this.authService.signout(reply);
    });

    fastify.post('/refresh', async (request: AppRequest, reply) => {
      const refreshToken =
        (request.body as RefreshBody).refreshToken ??
        request.cookies.refresh_token ??
        '';
      if (!refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const tokens = await this.authService.refreshToken(refreshToken);
      setTokenCookie(reply, tokens);

      return tokens;
    });
  };
}
