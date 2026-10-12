import { Button } from "@/components/ui/button";
import { getDictionary, isLocaleActive, localePath, type Locale } from "@/lib/i18n";
import { getMainNav } from "@/lib/navigation";
import { APP_URLS } from "@/lib/site";

import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const items = getMainNav(dict);
  // Hidden until the English phase. Per-page alternates are wired in then;
  // for now the switcher would point to the other language's home.
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const showLanguageSwitcher = isLocaleActive(otherLocale);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-20 lg:px-6">
        <Logo locale={locale} priority className="size-12 lg:size-16" />

        <DesktopNav locale={locale} items={items} label={dict.nav.mainLabel} />

        <div className="flex items-center gap-2">
          {showLanguageSwitcher && (
            <LanguageSwitcher
              href={localePath(otherLocale, "/")}
              label={dict.languageSwitcher.label}
              hrefLang={otherLocale}
            />
          )}
          <a
            href={APP_URLS.login}
            className="hidden rounded-lg px-3 py-2 text-base font-medium hover:bg-muted sm:inline-flex"
          >
            {dict.nav.login}
          </a>
          <Button asChild size="lg" className="h-10 px-4 text-base">
            <a href={APP_URLS.signup}>{dict.nav.signup}</a>
          </Button>
          <MobileMenu locale={locale} items={items} dict={dict.nav} />
        </div>
      </div>
    </header>
  );
}
