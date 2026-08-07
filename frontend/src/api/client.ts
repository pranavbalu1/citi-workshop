const API_URL = import.meta.env.VITE_API_URL || "";

export interface ApiError {
  detail?: string;
  message?: string;
}

export class ApiRequestError extends Error {
  status: number;
  data: ApiError | null;

  constructor(
    message: string,
    status: number,
    data: ApiError | null = null,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { authenticated = false, headers, ...fetchOptions } = options;

  const requestHeaders = new Headers(headers);

  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new ApiRequestError(
        "Authentication required.",
        401,
      );
    }

    requestHeaders.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...fetchOptions,
      headers: requestHeaders,
    },
  );

  const contentType = response.headers.get("content-type");

  let data: T | ApiError | null = null;

  if (contentType?.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    data = text ? (text as T) : null;
  }

  if (!response.ok) {
    const errorData = data as ApiError | null;

    throw new ApiRequestError(
      errorData?.detail ??
        errorData?.message ??
        `Request failed with status ${response.status}.`,
      response.status,
      errorData,
    );
  }

  return data as T;
}

export const api = {
  get<T>(
    path: string,
    options: RequestOptions = {},
  ) {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body:
        body instanceof URLSearchParams
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body:
        body instanceof URLSearchParams
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body:
        body instanceof URLSearchParams
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  },

  delete<T>(
    path: string,
    options: RequestOptions = {},
  ) {
    return request<T>(path, {
      ...options,
      method: "DELETE",
    });
  },
};
