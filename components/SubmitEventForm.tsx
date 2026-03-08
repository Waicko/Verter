"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

const ERROR_MESSAGE = "Lähetys epäonnistui. Yritä myöhemmin uudelleen.";

type EventType = "race" | "camp" | "community";

interface FormState {
  title: string;
  date: string;
  location: string;
  registration_url: string;
  description: string;
  event_type: EventType;
  company: string;
}

const INITIAL: FormState = {
  title: "",
  date: "",
  location: "",
  registration_url: "",
  description: "",
  event_type: "community",
  company: "",
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

export default function SubmitEventForm() {
  const router = useRouter();
  const [data, setData] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof FormState, v: string) => {
    setData((prev) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (data.company.trim()) {
      return;
    }

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

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const payload = {
        title,
        date,
        location: data.location.trim() || null,
        description: data.description.trim() || null,
        registration_url: data.registration_url.trim() || null,
        type: data.event_type,
        status: "draft",
      };
      const { error: insertError } = await supabase.from("events").insert(payload);

      if (insertError) {
        setError(insertError.message ?? ERROR_MESSAGE);
        return;
      }

      router.push("/submit/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGE);
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
        <label htmlFor="event_type" className="block text-sm font-medium text-verter-graphite">
          Tyyppi
        </label>
        <select
          id="event_type"
          value={data.event_type}
          onChange={(e) => update("event_type", e.target.value as EventType)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
        >
          <option value="community">Yhteisötapahtuma</option>
          <option value="race">Kilpailu</option>
          <option value="camp">Leiri</option>
        </select>
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

      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          value={data.company}
          onChange={(e) => update("company", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Lähetetään…" : "Lähetä"}
      </button>
    </form>
  );
}
