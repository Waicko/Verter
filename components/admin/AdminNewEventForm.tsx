"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import EventForm, { type EventFormData } from "./EventForm";

const TOKEN_KEY = "admin_token";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export default function AdminNewEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EventFormData) => {
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Admin-tunnus puuttuu. Palaa tapahtumalistalle ja syötä tunnus.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/events/create", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          title: data.title,
          date: data.date,
          location: data.location || null,
          registration_url: data.registration_url || null,
          description: data.description || null,
          type: data.type || "race",
          status: data.status,
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
