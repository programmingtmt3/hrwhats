import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { getFaq, t } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { parseInlineLinks } from "@/lib/inline-links";
import { faqPageJsonLd } from "@/lib/seo";

import { SectionHeading } from "../SectionHeading";
import { FaqList } from "./FaqList";

function renderAnswer(text: string, locale: Locale) {
  return parseInlineLinks(text).map((part, i) =>
    typeof part === "string" ? (
      part
    ) : (
      <Link key={i} href={localePath(locale, part.href)}>
        {part.label}
      </Link>
    ),
  );
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
