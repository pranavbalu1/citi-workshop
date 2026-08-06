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

const API_URL = import.meta.env.VITE_API_URL || "";

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const body = new URLSearchParams();

  body.append("username", credentials.email);
  body.append("password", credentials.password);

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Invalid email or password.");
  }

  return response.json();
}

export async function register(
  credentials: RegisterCredentials,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: credentials.name,
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Registration failed. Please try again.");
  }

  return response.json();
}
