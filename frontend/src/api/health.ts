import { api } from "./client";

export interface ApiHealthResponse {
  status: string;
}

export interface MongoDBHealthResponse {
  status: string;
  error?: string;
}

export interface JwtHealthResponse {
  status: string;
  current_user_id: string;
  authenticated: boolean;
}

export function healthCheck(): Promise<ApiHealthResponse> {
  return api.get<ApiHealthResponse>(
    "/api/health",
  );
}

export function mongodbHealthCheck(): Promise<MongoDBHealthResponse> {
  return api.get<MongoDBHealthResponse>(
    "/api/health/mongodb",
  );
}

export function jwtHealthCheck(): Promise<JwtHealthResponse> {
  return api.get<JwtHealthResponse>(
    "/api/health/jwt",
    {
      authenticated: true,
    },
  );
}
