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
    fastify.post<{ Body: SignUpParams }>('/signup', async (request, reply) => {
      const authResult = await this.authService.signup(request.body);
      return authResult;
    });

    fastify.post<{ Body: string }>('/signin', async (request, reply) => {
      const body = JSON.parse(request.body);
      const authResult: AuthResult = await this.authService.signin(
        body as SignInParams,
      );
      console.log(reply, authResult.tokens);
      setTokenCookie(reply, authResult.tokens);
      return authResult;
    });

    fastify.post('/signout', async (request, reply) => {
      this.authService.signout(reply);
    });

    fastify.post<{ Body: RefreshBody }>('/refresh', async (request, reply) => {
      const refreshToken =
        request.body.refreshToken ?? request.cookies.refresh_token ?? '';
      if (!refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const tokens = await this.authService.refreshToken(refreshToken);
      setTokenCookie(reply, tokens);

      return tokens;
    });
  };
}
