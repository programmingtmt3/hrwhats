import { getSite } from "@/lib/content";
import { getDictionary, isLocaleActive, localePath, type Locale } from "@/lib/i18n";
import { getMainNav, localizeLinks } from "@/lib/navigation";

import { BrandLogo } from "./BrandLogo";
import { HeaderBar } from "./HeaderBar";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const site = getSite();
  const items = localizeLinks(locale, getMainNav(dict, site));
  // Shown once the other language is published (see src/lib/translations.ts).
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <HeaderBar
      logo={<BrandLogo sizes="66px" priority />}
      homeHref={localePath(locale, "/")}
      items={items}
      labels={{
        logo: dict.nav.logoLabel,
        dashboard: dict.nav.dashboard,
        signup: dict.nav.signup,
        menu: dict.nav.menu,
        newTab: dict.nav.newTab,
      }}
      urls={site.appUrls}
      languageSwitch={
        isLocaleActive(otherLocale)
          ? { from: locale, to: otherLocale, label: dict.languageSwitcher.label }
          : undefined
      }
    />
  );
}
