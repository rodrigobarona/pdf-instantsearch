import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized paths – adjust if needed.
  matcher: ["/", "/(pt|en|fr)/:path*"],
};
