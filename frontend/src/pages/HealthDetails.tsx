import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, LogOut, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { jwtHealthCheck } from "@/api/health";

interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

type HealthStatus = "checking" | "healthy" | "failed";

function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT");
  }

  const payload = parts[1];

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return JSON.parse(atob(paddedBase64));
}

function formatTimestamp(timestamp?: number) {
  if (!timestamp) {
    return "N/A";
  }

  return new Date(timestamp * 1000).toLocaleString();
}

export function HealthDetails() {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);

  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      navigate("/login");
      return;
    }

    try {
      const decoded = decodeJwt(storedToken);

      setToken(storedToken);
      setPayload(decoded);

      jwtHealthCheck()
        .then(() => {
          setHealthStatus("healthy");
        })
        .catch(() => {
          setHealthStatus("failed");
        });
    } catch {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [navigate]);

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

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!token || !payload) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-6 text-primary" />

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Health Details
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              JWT authentication and backend verification
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="size-4" />
            Log Out
          </Button>
        </header>

        {/* JWT Health Check */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Authentication Status</h2>

              <p className="text-sm text-muted-foreground">
                Verifies your JWT against the FastAPI backend
              </p>
            </div>

            {healthStatus === "checking" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Checking...
              </div>
            )}

            {healthStatus === "healthy" && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-500">
                <CheckCircle2 className="size-4" />
                JWT Valid
              </div>
            )}

            {healthStatus === "failed" && (
              <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive">
                <XCircle className="size-4" />
                JWT Invalid
              </div>
            )}
          </div>

          {healthStatus === "healthy" && (
            <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Authenticated User
              </p>

              <p className="mt-1 font-mono text-sm break-all">
                {payload.sub ?? "Unknown"}
              </p>
            </div>
          )}

          {healthStatus === "failed" && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                The backend rejected your JWT. It may be expired, invalid, or
                incorrectly signed.
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

        {/* Token Information */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Token Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Information extracted from your JWT
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                User ID
              </p>

              <p className="mt-2 font-mono text-sm break-all">
                {payload.sub ?? "N/A"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Issued At
              </p>

              <p className="mt-2 text-sm">{formatTimestamp(payload.iat)}</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Expires At
              </p>

              <p className="mt-2 text-sm">{formatTimestamp(payload.exp)}</p>
            </div>
          </div>
        </section>

        {/* JWT Payload */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">JWT Payload</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Decoded payload from your access token
          </p>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </section>

        {/* Raw Token */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Access Token</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                The JWT currently stored in localStorage
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToken}
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
