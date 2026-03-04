import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Explicitly include "/" so root gets middleware redirect; exclude api, static, Vercel internals
  matcher: ["/", "/((?!api|_next|_vercel|admin|events|.*\\..*).*)"],
};
