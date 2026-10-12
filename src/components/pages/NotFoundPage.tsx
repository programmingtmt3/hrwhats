import Link from "next/link";

import { getDictionary, localePath, type Locale } from "@/lib/i18n";

export function NotFoundPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

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
      </div>
    </section>
  );
}
