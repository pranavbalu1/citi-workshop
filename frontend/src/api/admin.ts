import { api } from "./client";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface UserRoleUpdateResponse {
  message: string;
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface UserStatusUpdateResponse {
  message: string;
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface UserDeleteResponse {
  message: string;
  id: string;
  username: string;
  email: string;
}

export async function fetchAllUsers(): Promise<User[]> {
  return api.get<User[]>("/api/admin/users", { authenticated: true });
}

export async function fetchUserDetails(userId: string): Promise<User> {
  return api.get<User>(`/api/admin/users/${userId}`, { authenticated: true });
}

export async function deleteUser(userId: string): Promise<UserDeleteResponse> {
  return api.delete<UserDeleteResponse>(`/api/admin/users/${userId}`, {
    authenticated: true,
  });
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<UserRoleUpdateResponse> {
  return api.put<UserRoleUpdateResponse>(
    `/api/admin/users/${userId}/role`,
    { role },
    { authenticated: true }
  );
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean
): Promise<UserStatusUpdateResponse> {
  return api.patch<UserStatusUpdateResponse>(
    `/api/admin/users/${userId}/status`,
    { is_active: isActive },
    { authenticated: true }
  );
}