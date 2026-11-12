import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { NewTabLink } from "@/components/ui/NewTabLink";
import { getFaq, getSite, tRequired } from "@/lib/content";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { docsPath, parseInlineLinks } from "@/lib/inline-links";
import { localizeLink } from "@/lib/navigation";
import { faqPageJsonLd } from "@/lib/seo";

import { SectionHeading } from "../SectionHeading";
import { FaqList } from "./FaqList";

/** Inline links: internal paths stay in the site; `docs:/path/` opens the usage guide in a new tab. */
function renderAnswer(text: string, locale: Locale) {
  const newTab = getDictionary(locale).nav.newTab;
  return parseInlineLinks(text).map((part, i) => {
    if (typeof part === "string") return part;
    const docs = docsPath(part.href);
    if (docs !== null) {
      // The usage guide exists only in Arabic.
      return (
        <NewTabLink
          key={i}
          href={new URL(docs, getSite().docsUrl).href}
          hrefLang={locale === "ar" ? undefined : "ar"}
          label={format(newTab, { label: part.label })}
        >
          {part.label}
        </NewTabLink>
      );
    }
    const link = localizeLink(locale, part.href, part.label);
    return (
      <Link key={i} href={link.href} hrefLang={link.hrefLang}>
        {link.label}
      </Link>
    );
  });
}

export function Faq({ locale }: { locale: Locale }) {
  const { faq: heading } = getDictionary(locale).home;
  const items = getFaq().map((item) => ({
    question: tRequired(item.question, locale),
    answer: tRequired(item.answer, locale),
  }));

  return (
    <section id="faq">
      <JsonLd data={faqPageJsonLd(items)} />
      <div className="site-container">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} />
        <FaqList
          entries={items.map(({ question, answer }) => ({
            question,
            answer: renderAnswer(answer, locale),
          }))}
        />
      </div>
    </section>
  );
}
