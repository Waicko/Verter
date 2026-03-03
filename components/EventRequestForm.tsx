"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface EventRequestFormProps {
  eventSlug: string;
  eventName: string;
}

export default function EventRequestForm({
  eventSlug,
  eventName,
}: EventRequestFormProps) {
  const t = useTranslations("events");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t("formNameRequired");
    if (!email.trim()) next.email = t("formEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = t("formEmailRequired");
    }
    if (!question.trim()) next.question = t("formQuestionRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    setName("");
    setEmail("");
    setQuestion("");
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="mt-6 rounded-card border border-verter-border bg-verter-ice/50 p-4">
        <p className="font-medium text-verter-forest">{t("formSuccess")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="event-name" className="block text-sm font-medium text-verter-graphite">
          {t("formName")} *
        </label>
        <input
          id="event-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-verter-risky">{errors.name}</p>
        )}
      </div>
      <div>
        <label htmlFor="event-email" className="block text-sm font-medium text-verter-graphite">
          {t("formEmail")} *
        </label>
        <input
          id="event-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-verter-risky">{errors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="event-question" className="block text-sm font-medium text-verter-graphite">
          {t("formQuestion")} *
        </label>
        <textarea
          id="event-question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          aria-invalid={!!errors.question}
        />
        {errors.question && (
          <p className="mt-1 text-sm text-verter-risky">{errors.question}</p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-card bg-verter-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2"
      >
        {t("formSend")}
      </button>
    </form>
  );
}
