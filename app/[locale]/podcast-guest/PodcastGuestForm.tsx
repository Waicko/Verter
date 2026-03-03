"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cardClass, primaryBtn } from "@/lib/styles";

export default function PodcastGuestForm() {
  const t = useTranslations("podcastGuest");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/podcast/guest-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim() || null,
          message: data.message.trim() || null,
        }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const err = await res.json();
        alert(err.error ?? "Submit failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={`mt-8 ${cardClass}`}>
        <div className="p-6 text-center">
          <p className="text-lg font-medium text-verter-graphite">
            {t("success")}
          </p>
          <p className="mt-2 text-verter-muted">{t("successHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className={`space-y-4 ${cardClass}`}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("name")} *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              required
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("email")}
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("message")}
            </label>
            <textarea
              value={data.message}
              onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`mt-6 ${primaryBtn}`}
      >
        {loading ? "…" : t("submit")}
      </button>
    </form>
  );
}
