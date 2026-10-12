import { getDictionary, type Locale } from "@/lib/i18n";

// Placeholder until the home page phase.
export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 text-center lg:px-6">
      <h1 className="text-4xl font-bold text-brand-900">{dict.home.placeholderTitle}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{dict.home.placeholderText}</p>
    </section>
  );
}
