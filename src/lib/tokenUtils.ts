import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

const TOKEN_KEY = "auth_token";

export const tokenUtils = {
  save: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  decode: (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  },

  isValid: (token: string): boolean => {
    const decoded = tokenUtils.decode(token);
    if (!decoded) return false;
    return decoded.exp * 1000 > Date.now();
  },

  getCurrent: (): DecodedToken | null => {
    const token = tokenUtils.get();
    if (!token) return null;
    if (!tokenUtils.isValid(token)) {
      tokenUtils.remove();
      return null;
    }
    return tokenUtils.decode(token);
  },
};
