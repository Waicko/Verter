"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import EventForm, { type EventFormData } from "./EventForm";

export default function AdminNewEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EventFormData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events/create", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          date: data.date,
          location: data.location || null,
          registration_url: data.registration_url || null,
          description: data.description || null,
          type: data.type || "race",
          status: data.status,
          source_type: data.source_type?.trim() || null,
          source_name: data.source_name?.trim() || null,
          source_url: data.source_url?.trim() || null,
          submitted_by_name: data.submitted_by_name?.trim() || null,
          submitted_by_email: data.submitted_by_email?.trim() || null,
          rights_basis: data.rights_basis?.trim() || null,
          license_name: data.license_name?.trim() || null,
          license_url: data.license_url?.trim() || null,
          verification_status: data.verification_status?.trim() || null,
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
    <EventForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Luo tapahtuma"
      cancelHref="/admin/events"
    />
  );
}
