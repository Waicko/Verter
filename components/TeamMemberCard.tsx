"use client";

import { cardClass } from "@/lib/styles";
import type { TeamMember } from "@/lib/data/team";

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {

  return (
    <div className={cardClass}>
      <div className="flex items-start gap-4 p-4">
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-verter-ice text-verter-blue">
            <span className="text-xl font-semibold">{member.name.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-semibold text-verter-graphite">
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-0.5 text-sm font-medium text-verter-blue">
              {member.role}
            </p>
          )}
          {member.tagline && (
            <p className="mt-2 text-sm text-verter-muted">{member.tagline}</p>
          )}
          {member.strava_url && (
            <a
              href={member.strava_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-verter-forest hover:underline"
            >
              Strava →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
