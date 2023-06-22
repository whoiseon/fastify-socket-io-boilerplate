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

export default class AuthController {
  private authService = new AuthService();

  constructor() {}

  public routes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/signup', async (request, reply) => {
      const authResult = await this.authService.signup(
        request.body as SignUpParams,
      );
      return authResult;
    });

    fastify.post('/signin', async (request, reply) => {
      const authResult: AuthResult = await this.authService.signin(
        request.body as SignInParams,
      );
      setTokenCookie(reply, authResult.tokens);
      return authResult;
    });

    fastify.post('/signout', async (request, reply) => {
      this.authService.signout(reply);
    });

    fastify.post('/refresh', async (request, reply) => {
      console.log(request.cookies.refreshToken);
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
