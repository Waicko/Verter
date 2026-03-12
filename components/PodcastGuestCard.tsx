"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cardClass } from "@/lib/styles";
import type { PodcastGuest } from "@/lib/data/podcast";

interface PodcastGuestCardProps {
  guest: PodcastGuest;
  featured?: boolean;
  size?: "default" | "large";
}

export default function PodcastGuestCard({
  guest,
  featured,
  size = "default",
}: PodcastGuestCardProps) {
  const t = useTranslations("podcast");
  const isLarge = size === "large";

  return (
    <div className={cardClass}>
      <div className={`flex items-start gap-4 ${isLarge ? "p-6" : "p-4"}`}>
        {guest.image_url ? (
          <Image
            src={guest.image_url}
            alt={guest.name}
            width={isLarge ? 96 : 56}
            height={isLarge ? 96 : 56}
            className={`shrink-0 rounded-full object-cover ${
              isLarge ? "h-24 w-24" : "h-14 w-14"
            }`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-verter-ice text-verter-blue ${
              isLarge ? "h-24 w-24 text-2xl" : "h-14 w-14 text-xl"
            }`}
          >
            <span className="font-semibold">{guest.name.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className={`font-heading font-semibold text-verter-graphite ${
              isLarge ? "text-xl" : "text-base"
            }`}
          >
            {guest.name}
          </h3>
          {guest.role && (
            <p className="mt-0.5 text-sm font-medium text-verter-blue">
              {guest.role}
            </p>
          )}
          {guest.tagline && (
            <p className={`mt-2 text-verter-muted ${isLarge ? "text-base" : "text-sm"}`}>
              {guest.tagline}
            </p>
          )}
          {(guest.episode_url || guest.links) && (
            <div className="mt-3 flex flex-wrap gap-3">
              {guest.episode_url && (
                <a
                  href={guest.episode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-verter-forest hover:underline"
                >
                  {guest.featured ? t("listenEpisode") : "→"}
                </a>
              )}
              {guest.links &&
                Object.entries(guest.links).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-verter-muted hover:text-verter-forest hover:underline"
                  >
                    {key}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
