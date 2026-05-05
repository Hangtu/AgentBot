import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // "always" = every URL gets a locale prefix.
  // / → 307 redirect to /es (or browser-detected locale)
  // /en/about → serves English content
  // /es/about → serves Spanish content
  localePrefix: "always",
});
