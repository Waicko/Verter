"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";

const TOKEN_KEY = "admin_events_token";

interface FormState {
  title: string;
  date: string;
  location: string;
  registration_url: string;
  description: string;
  publishNow: boolean;
}

const INITIAL: FormState = {
  title: "",
  date: "",
  location: "",
  registration_url: "",
  description: "",
  publishNow: true,
};

function isValidUrl(s: string): boolean {
  if (!s.trim()) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export default function AdminNewEventForm() {
  const router = useRouter();
  const [data, setData] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof FormState, v: string | boolean) => {
    setData((prev) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const title = data.title.trim();
    const date = data.date.trim();
    if (!title || !date) {
      setError("Täytä vaaditut kentät (otsikko ja päivämäärä).");
      return;
    }

    if (data.registration_url.trim() && !isValidUrl(data.registration_url.trim())) {
      setError("Anna kelvollinen URL ilmoittautumislinkille.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Admin-tunnus puuttuu. Palaa tapahtumalistalle ja syötä tunnus.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          title,
          date,
          location: data.location.trim() || null,
          registration_url: data.registration_url.trim() || null,
          description: data.description.trim() || null,
          status: data.publishNow ? "published" : "draft",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "Lähetys epäonnistui.");
        return;
      }

      router.push("/admin/events");
    } catch {
      setError("Lähetys epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-verter-graphite">
          Otsikko <span className="text-verter-risky">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          required
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder="esim. Nuuksion polkujuoksukilpailu"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-verter-graphite">
          Päivämäärä <span className="text-verter-risky">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={data.date}
          onChange={(e) => update("date", e.target.value)}
          required
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-verter-graphite">
          Sijainti <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <input
          id="location"
          type="text"
          value={data.location}
          onChange={(e) => update("location", e.target.value)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder="esim. Helsinki"
        />
      </div>

      <div>
        <label htmlFor="registration_url" className="block text-sm font-medium text-verter-graphite">
          Ilmoittautumislinkki <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <input
          id="registration_url"
          type="url"
          value={data.registration_url}
          onChange={(e) => update("registration_url", e.target.value)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-verter-graphite">
          Kuvaus <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder="Lyhyt kuvaus tapahtumasta"
        />
      </div>

      <div>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={data.publishNow}
            onChange={(e) => update("publishNow", e.target.checked)}
            className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-forest"
          />
          <span className="text-sm font-medium text-verter-graphite">
            Julkaise heti
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Lähetetään…" : "Luo tapahtuma"}
        </button>
        <Link
          href="/admin/events"
          className="inline-block rounded-card border border-verter-border bg-white px-4 py-3 font-medium text-verter-graphite hover:bg-verter-snow"
        >
          Peruuta
        </Link>
      </div>
    </form>
  );
}
