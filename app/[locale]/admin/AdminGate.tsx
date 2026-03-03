"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-verter-border bg-white p-6 shadow-soft"
      >
        <h2 className="font-heading text-xl font-semibold text-verter-graphite">
          Admin access
        </h2>
        <p className="mt-1 text-sm text-verter-muted">
          Enter the admin password to continue.
        </p>
        <div className="mt-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-pill bg-verter-forest px-4 py-2 font-medium text-white transition hover:bg-verter-forest/90 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
