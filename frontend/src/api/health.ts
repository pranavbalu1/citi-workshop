import { api } from "./client";

export interface ApiHealthResponse {
  status: string;
}

export interface PostgresHealthResponse {
  status: string;
  error?: string;
}

export interface JwtHealthResponse {
  status: string;
  current_user_id: string;
  authenticated: boolean;
}

export function healthCheck(): Promise<ApiHealthResponse> {
  return api.get<ApiHealthResponse>("/api/health");
}

export function postgresHealthCheck(): Promise<PostgresHealthResponse> {
  return api.get<PostgresHealthResponse>("/api/health/postgres");
}

export function jwtHealthCheck(): Promise<JwtHealthResponse> {
  return api.get<JwtHealthResponse>("/api/health/jwt", {
    authenticated: true,
  });
}
