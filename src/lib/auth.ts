export const AUTH_COOKIE_NAME = 'vw_auth';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('JWT secret is not configured');
  return secret;
}
