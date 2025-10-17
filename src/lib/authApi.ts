import { saveToken, clearAuth } from "./auth.utils";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data: AuthResponse = await response.json();
    if (data.token) {
      saveToken(data.token);
    }
    return data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    return response.json();
  },

  logout: () => {
    clearAuth();
  },
};
