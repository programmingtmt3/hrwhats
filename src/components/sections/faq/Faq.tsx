import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { NewTabLink } from "@/components/ui/NewTabLink";
import { getFaq, getSite, t } from "@/lib/content";
import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";
import { docsPath, parseInlineLinks } from "@/lib/inline-links";
import { faqPageJsonLd } from "@/lib/seo";

import { SectionHeading } from "../SectionHeading";
import { FaqList } from "./FaqList";

/** Inline links: internal paths stay in the site; `docs:/path/` opens the usage guide in a new tab. */
function renderAnswer(text: string, locale: Locale) {
  const newTab = getDictionary(locale).nav.newTab;
  return parseInlineLinks(text).map((part, i) => {
    if (typeof part === "string") return part;
    const docs = docsPath(part.href);
    return docs !== null ? (
      <NewTabLink key={i} href={new URL(docs, getSite().docsUrl).href} label={format(newTab, { label: part.label })}>
        {part.label}
      </NewTabLink>
    ) : (
      <Link key={i} href={localePath(locale, part.href)}>
        {part.label}
      </Link>
    );
  });
}

export function Faq({ locale }: { locale: Locale }) {
  const { faq: heading } = getDictionary(locale).home;
  const items = getFaq().map((item) => ({
    question: t(item.question, locale),
    answer: t(item.answer, locale),
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
