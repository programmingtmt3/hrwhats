import Link from "next/link";

import { getDictionary, isLocaleActive, localePath, type Locale } from "@/lib/i18n";

export function NotFoundPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  // out/404.html is Arabic and serves every unknown URL, /en/… included: once English is
  // published, it also carries one English line linking to the English home.
  const english = locale === "ar" && isLocaleActive("en") ? getDictionary("en").notFound : null;

  return (
    <section className="pt-[160px] text-center">
      <div className="site-container flex flex-col items-center">
        <span className="eyebrow">404</span>
        <h1 className="mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.35] font-bold">
          {dict.notFound.title}
        </h1>
        <p className="mt-3 text-[1.08rem] text-muted-foreground">{dict.notFound.description}</p>
        <Link href={localePath(locale, "/")} className="btn btn-primary mt-9">
          {dict.notFound.backHome}
        </Link>
        {english && (
          <p lang="en" dir="ltr" className="mt-8 text-muted-foreground">
            {english.title}.{" "}
            <Link href={localePath("en", "/")} hrefLang="en" className="font-medium text-green underline">
              {english.backHome}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
