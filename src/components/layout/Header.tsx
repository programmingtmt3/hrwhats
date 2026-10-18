import { getSite } from "@/lib/content";
import { getDictionary, isLocaleActive, localePath, type Locale } from "@/lib/i18n";
import { getMainNav } from "@/lib/navigation";

import { BrandLogo } from "./BrandLogo";
import { HeaderBar } from "./HeaderBar";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const site = getSite();
  const items = getMainNav(dict).map((item) => ({ ...item, href: localePath(locale, item.href) }));
  // Hidden until the English phase; per-page alternates are wired in then.
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
      }}
      urls={site.appUrls}
      extra={
        isLocaleActive(otherLocale) ? (
          <LanguageSwitcher
            href={localePath(otherLocale, "/")}
            label={dict.languageSwitcher.label}
            hrefLang={otherLocale}
          />
        ) : undefined
      }
    />
  );
}
