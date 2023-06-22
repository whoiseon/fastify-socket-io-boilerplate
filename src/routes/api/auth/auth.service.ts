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

export default class AuthService {
  private SALT_ROUNDS = 10;

  constructor() {}

  public signup = async ({
    name,
    username,
    password,
  }: SignUpParams): Promise<{ user: User }> => {
    const exists = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (exists) {
      throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    const signUpUser = await db.user.create({
      data: {
        name,
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
    const findUser = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (!findUser) {
      throw new Error('User not found');
    }

    try {
      const result = await bcrypt.compare(password, findUser.password);
      if (!result) {
        throw new Error('WrongCredentials');
      }
    } catch (e) {
      throw new Error('Unknown');
    }

    const { password: passwordHash, ...user } = findUser;

    const tokens = await this.generateTokens(findUser);
    return {
      user,
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
      throw new Error('InvalidToken');
    }
  };

  public generateTokens = async (user: User, tokenItem?: Token) => {
    const { id: userId, name, username } = user;
    const token = tokenItem ?? (await this.createTokenItem(userId));
    const tokenId = token.id;

    const [accessToken, refreshToken] = await Promise.all([
      generateToken({
        type: 'access_token',
        userId,
        username,
        tokenId,
        name,
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
