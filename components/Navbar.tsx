"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { href: "/routes", key: "routes" },
  { href: "/events", key: "events" },
  { href: "/content", key: "content" },
  { href: "/podcast", key: "podcast" },
  { href: "/about", key: "about" },
] as const;

function NavLinks({
  pathname,
  isMobile = false,
}: {
  pathname: string;
  isMobile?: boolean;
}) {
  const t = useTranslations("nav");

  const linkClass = (href: string) => {
    const isActive =
      href === "/routes"
        ? pathname === "/routes" || pathname.startsWith("/routes/")
        :       href === "/events"
          ? pathname === "/events" || pathname.startsWith("/events/")
          : href === "/podcast"
            ? pathname === "/podcast" || pathname.startsWith("/podcast")
            : pathname === href || pathname.startsWith(`${href}/`);
    return `font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 rounded-sm ${
      isActive
        ? "text-verter-forest underline decoration-verter-forest decoration-2 underline-offset-4"
        : "text-verter-muted hover:text-verter-graphite"
    } ${isMobile ? "block py-3 text-base" : "text-sm"}`;
  };

  return (
    <>
      {navLinks.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={linkClass(item.href)}
        >
          {t(item.key)}
        </Link>
      ))}
    </>
  );
}

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-verter-border bg-verter-snow/95 backdrop-blur supports-[backdrop-filter]:bg-verter-snow/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo
          brandName={tCommon("brandName")}
          className="text-2xl sm:text-[1.75rem]"
        />
        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLinks pathname={pathname} />
          <LanguageSwitcher />
        </div>
        {/* Mobile: language + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-sm p-2 text-verter-graphite hover:bg-verter-border/50 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-verter-border bg-verter-snow px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLinks pathname={pathname} isMobile />
          </nav>
        </div>
      )}
    </nav>
  );
}
