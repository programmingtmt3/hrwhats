import { getDictionary, type Locale } from "@/lib/i18n";

// Placeholder — replaced section by section (Hero is next).
export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="pt-[160px] text-center">
      <div className="site-container">
        <h1 className="text-4xl font-bold">{dict.home.placeholderTitle}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{dict.home.placeholderText}</p>
      </div>
    </section>
  );
}
