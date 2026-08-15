import { api } from "./client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const body = new URLSearchParams();

  body.append("username", credentials.email);
  body.append("password", credentials.password);

  return api.post<LoginResponse>("/api/auth/login", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function register(
  credentials: RegisterCredentials,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("/api/auth/register", {
    username: credentials.name,
    email: credentials.email,
    password: credentials.password,
  });
}
