import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

export function NotFoundPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-900">404</p>
      <h1 className="mt-4 text-2xl font-bold">{dict.notFound.title}</h1>
      <p className="mt-3 text-muted-foreground">{dict.notFound.description}</p>
      <Button asChild size="lg" className="mt-8 h-11 px-6 text-base">
        <Link href={localePath(locale, "/")}>{dict.notFound.backHome}</Link>
      </Button>
    </section>
  );
}
