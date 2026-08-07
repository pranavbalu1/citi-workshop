import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Database,
  LogOut,
  RefreshCw,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  healthCheck,
  jwtHealthCheck,
  mongodbHealthCheck,
} from "@/api/health";

type HealthStatus = "checking" | "healthy" | "failed";

interface HealthResponse {
  status: string;
  current_user_id?: string;
  authenticated?: boolean;
  error?: string;
}

interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

interface HealthResult {
  status: HealthStatus;
  data: HealthResponse | null;
  error: string | null;
}

function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT");
  }

  const payload = parts[1];

  const base64 = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return JSON.parse(atob(paddedBase64)) as JwtPayload;
}

function formatTimestamp(timestamp?: number) {
  if (!timestamp) {
    return "N/A";
  }

  return new Date(timestamp * 1000).toLocaleString();
}

function StatusBadge({
  status,
}: {
  status: HealthStatus;
}) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Checking...
      </div>
    );
  }

  if (status === "healthy") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-500">
        <CheckCircle2 className="size-4" />
        Healthy
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive">
      <XCircle className="size-4" />
      Failed
    </div>
  );
}

export function HealthDetails() {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [copied, setCopied] = useState(false);

  const [backend, setBackend] = useState<HealthResult>({
    status: "checking",
    data: null,
    error: null,
  });

  const [mongodb, setMongodb] = useState<HealthResult>({
    status: "checking",
    data: null,
    error: null,
  });

  const [jwt, setJwt] = useState<HealthResult>({
    status: "checking",
    data: null,
    error: null,
  });

  const runHealthChecks = useCallback(async () => {
    setBackend({
      status: "checking",
      data: null,
      error: null,
    });

    setMongodb({
      status: "checking",
      data: null,
      error: null,
    });

    setJwt({
      status: "checking",
      data: null,
      error: null,
    });

    const [backendResult, mongodbResult, jwtResult] =
      await Promise.allSettled([
        healthCheck(),
        mongodbHealthCheck(),
        jwtHealthCheck(),
      ]);

    if (backendResult.status === "fulfilled") {
      setBackend({
        status: "healthy",
        data: backendResult.value as HealthResponse,
        error: null,
      });
    } else {
      setBackend({
        status: "failed",
        data: null,
        error:
          backendResult.reason instanceof Error
            ? backendResult.reason.message
            : "Backend health check failed.",
      });
    }

    if (mongodbResult.status === "fulfilled") {
      const data = mongodbResult.value as HealthResponse;

      setMongodb({
        status: data.status === "healthy" ? "healthy" : "failed",
        data,
        error:
          data.status === "healthy"
            ? null
            : data.error ?? "MongoDB is unhealthy.",
      });
    } else {
      setMongodb({
        status: "failed",
        data: null,
        error:
          mongodbResult.reason instanceof Error
            ? mongodbResult.reason.message
            : "MongoDB health check failed.",
      });
    }

    if (jwtResult.status === "fulfilled") {
      setJwt({
        status: "healthy",
        data: jwtResult.value as HealthResponse,
        error: null,
      });
    } else {
      setJwt({
        status: "failed",
        data: null,
        error:
          jwtResult.reason instanceof Error
            ? jwtResult.reason.message
            : "JWT health check failed.",
      });
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const decoded = decodeJwt(storedToken);

      setToken(storedToken);
      setPayload(decoded);

      void runHealthChecks();
    } catch {
      localStorage.removeItem("access_token");
      navigate("/login", { replace: true });
    }
  }, [navigate, runHealthChecks]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setToken(null);
    setPayload(null);

    navigate("/login", { replace: true });
  };

  const handleCopyToken = async () => {
    if (!token) {
      return;
    }

    await navigator.clipboard.writeText(token);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const allHealthy =
    backend.status === "healthy" &&
    mongodb.status === "healthy" &&
    jwt.status === "healthy";

  if (!token || !payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-7 text-primary" />

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Health Dashboard
              </h1>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Backend, MongoDB, and JWT authentication status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void runHealthChecks()}
              disabled={
                backend.status === "checking" ||
                mongodb.status === "checking" ||
                jwt.status === "checking"
              }
              className="gap-2"
            >
              <RefreshCw
                className={`size-4 ${
                  backend.status === "checking"
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="size-4" />
              Log Out
            </Button>
          </div>
        </header>

        {/* Overall status */}
        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                System Status
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Current status of all backend health checks
              </p>
            </div>

            {allHealthy ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-500">
                <CheckCircle2 className="size-4" />
                All Systems Operational
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
                <XCircle className="size-4" />
                System Check Failed
              </div>
            )}
          </div>
        </section>

        {/* Health checks */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Backend */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="size-5 text-primary" />
              </div>

              <StatusBadge status={backend.status} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              API Server
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              FastAPI application
            </p>

            {backend.error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {backend.error}
              </div>
            )}

            {backend.data && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Response
                </p>

                <p className="mt-1 font-mono text-sm">
                  {backend.data.status}
                </p>
              </div>
            )}
          </div>

          {/* MongoDB */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="size-5 text-primary" />
              </div>

              <StatusBadge status={mongodb.status} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              MongoDB
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Database connectivity
            </p>

            {mongodb.error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {mongodb.error}
              </div>
            )}

            {mongodb.data && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Response
                </p>

                <p className="mt-1 font-mono text-sm">
                  {mongodb.data.status}
                </p>
              </div>
            )}
          </div>

          {/* JWT */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="size-5 text-primary" />
              </div>

              <StatusBadge status={jwt.status} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              JWT Authentication
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Backend token verification
            </p>

            {jwt.error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {jwt.error}
              </div>
            )}

            {jwt.data && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Authenticated User
                </p>

                <p className="mt-1 break-all font-mono text-sm">
                  {jwt.data.current_user_id ??
                    payload.sub ??
                    "Unknown"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* JWT Authentication */}
        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Authentication Status
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your access token was decoded locally and verified
                against the FastAPI backend.
              </p>
            </div>

            <StatusBadge status={jwt.status} />
          </div>

          {jwt.status === "healthy" && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  User ID
                </p>

                <p className="mt-2 break-all font-mono text-sm">
                  {jwt.data?.current_user_id ??
                    payload.sub ??
                    "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Issued At
                </p>

                <p className="mt-2 text-sm">
                  {formatTimestamp(payload.iat)}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Expires At
                </p>

                <p className="mt-2 text-sm">
                  {formatTimestamp(payload.exp)}
                </p>
              </div>
            </div>
          )}

          {jwt.status === "failed" && (
            <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                The backend rejected your JWT. The token may be
                expired, invalid, or incorrectly signed.
              </p>

              <Button
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={handleLogout}
              >
                Log in again
              </Button>
            </div>
          )}
        </section>

        {/* JWT Payload */}
        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">
            JWT Payload
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Decoded payload from your access token
          </p>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </section>

        {/* Access Token */}
        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Access Token
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                JWT currently stored in localStorage
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopyToken()}
              className="shrink-0 gap-2"
            >
              <Copy className="size-3.5" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="break-all font-mono text-xs leading-relaxed text-muted-foreground">
              {token}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
