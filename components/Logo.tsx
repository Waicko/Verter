import { Link } from "@/i18n/navigation";

interface LogoProps {
  className?: string;
  brandName: string;
}

export default function Logo({
  className = "text-xl",
  brandName,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 rounded-sm py-2 ${className}`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M16 6L6 26h20L16 6z"
          className="fill-verter-blue"
        />
        <path
          d="M10 26L16 14l6 12H10z"
          className="fill-verter-forest"
        />
      </svg>
      <span className="font-heading font-semibold tracking-tight text-verter-forest text-inherit">
        {brandName}
      </span>
    </Link>
  );
}
