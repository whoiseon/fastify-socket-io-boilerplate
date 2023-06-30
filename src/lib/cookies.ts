import { FastifyReply } from 'fastify';

export function setTokenCookie(
  reply: FastifyReply,
  tokens: { accessToken: string; refreshToken: string },
) {
  reply.setCookie('access_token', tokens.accessToken, {
    expires: new Date(Date.now() + 1000 * 60 * 60),
    path: '/',
  });
  reply.setCookie('refresh_token', tokens.refreshToken, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    path: '/',
  });
}

export function clearTokenCookie(reply: FastifyReply) {
  reply.clearCookie('access_token', {
    httpOnly: false,
    path: '/',
  });
  reply.clearCookie('refresh_token', {
    httpOnly: false,
    path: '/',
  });
}
