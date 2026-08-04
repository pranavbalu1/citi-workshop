import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Invalid JWT");
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

  return JSON.parse(atob(base64));
}

export function AuthDetails() {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);

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
    } catch {
      localStorage.removeItem("access_token");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  if (!token || !payload) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Authentication details</h1>

            <p className="text-muted-foreground">Placeholder page</p>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut />
            Log out
          </Button>
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">JWT Payload</h2>

          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Access Token</h2>

          <p className="break-all font-mono text-xs text-muted-foreground">
            {token}
          </p>
        </section>
      </div>
    </main>
  );
}
