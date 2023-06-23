import { User } from '@prisma/client';

export interface SignUpParams {
  nickname: string;
  username: string;
  password: string;
}

export interface SignInParams {
  username: string;
  password: string;
}

export interface UserResult {
  id: number;
  nickname: string;
  username: string;
}

export interface AuthResult {
  user: UserResult;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshBody {
  refreshToken: string;
}
