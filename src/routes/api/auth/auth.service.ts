import { AuthResult, SignInParams, SignUpParams } from './auth.types';
import db from '../../../lib/database';
import bcrypt from 'bcrypt';
import { Token, User } from '@prisma/client';
import {
  RefreshTokenPayload,
  generateToken,
  validateToken,
} from '../../../lib/tokens';
import { FastifyReply } from 'fastify';
import { clearTokenCookie } from '../../../lib/cookies';
import AppError, { isAppError } from '../../../lib/AppError';

export default class AuthService {
  private SALT_ROUNDS = 10;

  constructor() {}

  public signup = async ({
    nickname,
    username,
    password,
  }: SignUpParams): Promise<{ user: User }> => {
    const exists = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (exists) {
      throw new AppError('AlreadyExists');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    const signUpUser = await db.user.create({
      data: {
        nickname,
        username,
        password: passwordHash,
      },
    });

    return {
      user: signUpUser,
    };
  };

  public signin = async ({
    username,
    password,
  }: SignInParams): Promise<AuthResult> => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new AppError('WrongCredentials');
    }

    try {
      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        throw new AppError('WrongCredentials');
      }
    } catch (e) {
      if (isAppError(e)) {
        throw e;
      }
      throw new AppError('Unknown');
    }

    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        username: user.username,
      },
      tokens,
    };
  };

  public signout = async (reply: FastifyReply) => {
    clearTokenCookie(reply);
    reply.status(204);
  };

  public refreshToken = async (token: string) => {
    try {
      const { tokenId, rotationCounter } =
        await validateToken<RefreshTokenPayload>(token);

      const tokenItem = await db.token.findUnique({
        where: {
          id: tokenId,
        },
        include: {
          user: true,
        },
      });

      if (!tokenItem) {
        throw new Error('NotFoundToken');
      }

      if (tokenItem.blocked) {
        throw new Error('BlockedToken');
      }

      if (tokenItem.rotationCounter !== rotationCounter) {
        await db.token.update({
          where: {
            id: tokenId,
          },
          data: {
            blocked: true,
          },
        });

        throw new Error('Rotation counter does not match');
      }

      tokenItem.rotationCounter += 1;

      await db.token.update({
        where: {
          id: tokenId,
        },
        data: {
          rotationCounter: tokenItem.rotationCounter,
        },
      });

      return this.generateTokens(tokenItem.user, tokenItem);
    } catch (e) {
      throw new AppError('RefreshFailure');
    }
  };

  public generateTokens = async (user: User, tokenItem?: Token) => {
    const { id: userId, nickname, username } = user;
    const token = tokenItem ?? (await this.createTokenItem(userId));
    const tokenId = token.id;

    const [accessToken, refreshToken] = await Promise.all([
      generateToken({
        type: 'access_token',
        userId,
        username,
        tokenId,
        nickname,
      }),
      generateToken({
        type: 'refresh_token',
        tokenId,
        rotationCounter: token.rotationCounter,
      }),
    ]);

    return {
      refreshToken,
      accessToken,
    };
  };

  public createTokenItem = async (userId: number) => {
    const token = await db.token.create({
      data: {
        userId,
      },
    });

    return token;
  };
}
