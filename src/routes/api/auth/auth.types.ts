import { User } from '@prisma/client';

export interface SignUpParams {
  name: string;
  username: string;
  password: string;
}

export interface SignInParams {
  username: string;
  password: string;
}

export interface UserResult {
  id: number;
  name: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
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
