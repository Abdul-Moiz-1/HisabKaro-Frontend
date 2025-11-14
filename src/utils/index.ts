import jwtDecode, { JwtPayload } from 'jwt-decode';
import { User } from '../types';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface AccessTokenClaims extends JwtPayload {
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email?: string;
}

export const extractUserFromToken = (token: string): User | null => {
  try {
    const claims = jwtDecode<AccessTokenClaims>(token);

    return {
      id: claims.sub ?? '',
      email: claims.email ?? '',
      name: claims.name ?? claims.preferred_username ?? undefined,
      firstName: claims.given_name ?? undefined,
      lastName: claims.family_name ?? undefined,
    };
  } catch {
    return null;
  }
};

