const API_URL = import.meta.env.VITE_API_URL || "";

interface JwtHealthResponse {
  status: string;
  authenticated: boolean;
  user_id: string;
}

export async function jwtHealthCheck(): Promise<JwtHealthResponse> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_URL}/api/health/jwt`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`JWT health check failed: ${response.status}`);
  }

  return response.json();
}
