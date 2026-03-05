"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";

export type EventFormData = {
  title: string;
  date: string;
  location: string;
  registration_url: string;
  description: string;
  status: "published" | "draft";
};

const emptyData: EventFormData = {
  title: "",
  date: "",
  location: "",
  registration_url: "",
  description: "",
  status: "published",
};

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel: string;
  cancelHref: string;
}

function isValidUrl(s: string): boolean {
  if (!s.trim()) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EventForm({
  mode,
  initialData,
  onSubmit,
  loading = false,
  error,
  submitLabel,
  cancelHref,
}: EventFormProps) {
  const data: EventFormData = {
    ...emptyData,
    ...initialData,
  };

  const [formState, setFormState] = useState(data);

  useEffect(() => {
    setFormState({ ...emptyData, ...initialData });
  }, [initialData]);

  const update = (k: keyof EventFormData, v: string) => {
    setFormState((prev) => ({ ...prev, [k]: v }));
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const title = formState.title.trim();
    const date = formState.date.trim();
    if (!title || !date) {
      setValidationError("Täytä vaaditut kentät (otsikko ja päivämäärä).");
      return;
    }
    if (formState.registration_url.trim() && !isValidUrl(formState.registration_url.trim())) {
      setValidationError("Anna kelvollinen URL ilmoittautumislinkille.");
      return;
    }
    await onSubmit({
      ...formState,
      title,
      date,
      location: formState.location.trim() || "",
      registration_url: formState.registration_url.trim() || "",
      description: formState.description.trim() || "",
    });
  };

  const inputClass =
    "mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest";

  const displayError = error ?? validationError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div
          role="alert"
          className="rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
        >
          {displayError}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-verter-graphite">
          Otsikko <span className="text-verter-risky">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formState.title}
          onChange={(e) => update("title", e.target.value)}
          required
          className={inputClass}
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
          value={formState.date}
          onChange={(e) => update("date", e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-verter-graphite">
          Sijainti <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <input
          id="location"
          type="text"
          value={formState.location}
          onChange={(e) => update("location", e.target.value)}
          className={inputClass}
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
          value={formState.registration_url}
          onChange={(e) => update("registration_url", e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-verter-graphite">
          Kuvaus <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <textarea
          id="description"
          value={formState.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Lyhyt kuvaus tapahtumasta"
        />
      </div>

      {mode === "create" ? (
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={formState.status === "published"}
              onChange={(e) =>
                update("status", e.target.checked ? "published" : "draft")
              }
              className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-forest"
            />
            <span className="text-sm font-medium text-verter-graphite">
              Julkaise heti
            </span>
          </label>
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-verter-graphite">
            Tila
          </label>
          <select
            value={formState.status}
            onChange={(e) =>
              update("status", e.target.value as "published" | "draft")
            }
            className={inputClass}
          >
            <option value="draft">Luonnos</option>
            <option value="published">Julkaistu</option>
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="inline-block rounded-card border border-verter-border bg-white px-4 py-3 font-medium text-verter-graphite hover:bg-verter-snow"
        >
          Peruuta
        </Link>
      </div>
    </form>
  );
}
