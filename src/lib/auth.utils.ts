import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

const TOKEN_KEY = "auth_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const saveToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: DecodedToken): boolean => {
  return token.exp * 1000 < Date.now();
};

export const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return !isTokenExpired(decoded);
};

export const getCurrentUser = (): DecodedToken | null => {
  const token = getStoredToken();
  if (!token) return null;

  if (!isTokenValid(token)) {
    clearAuth();
    return null;
  }

  return decodeToken(token);
};

export const clearAuth = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const API_ENDPOINTS = {
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  SESSION: "/api/auth/session",
};

interface AuthResponse {
  message?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
  error?: string;
}

export const authApi = {
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return response.json();
  },
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};
