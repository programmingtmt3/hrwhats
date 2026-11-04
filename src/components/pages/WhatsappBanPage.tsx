import { JsonLd } from "@/components/seo/JsonLd";
import { PageGlow } from "@/components/sections/PageGlow";
import { PageHero } from "@/components/sections/PageHero";
import {
  AlreadyBanned,
  BeforeCampaign,
  Closing,
  Compare,
  Help,
  Honest,
  Intro,
  Reasons,
  Steps,
} from "@/components/whatsapp-ban/Sections";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo";

/** /whatsapp-ban/ — why numbers get banned and how to use WhatsApp the right way (indexed page, kept URL). */
export function WhatsappBanPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.whatsappBan;
  const { honest, banned } = page;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [dict.nav.home, "/"],
          [page.name, "/whatsapp-ban/"],
        ])}
      />
      {/* The two questions answered on the page, with the same visible text. */}
      <JsonLd
        data={faqPageJsonLd([
          {
            question: honest.question,
            answer: [
              honest.statement,
              honest.text,
              honest.promise.before + honest.promise.quote + honest.promise.after,
            ].join(" "),
          },
          { question: banned.question, answer: banned.paragraphs.join(" ") },
        ])}
      />
      <PageGlow>
        <PageHero title={page.hero.title} lead={page.hero.question} />
        <Intro text={page.intro} />
        <Reasons text={page.reasons} />
      </PageGlow>
      <Honest text={honest} />
      <Compare text={page.compare} />
      <Help text={page.help} />
      <BeforeCampaign text={page.checklist} />
      <Steps text={page.steps} />
      <AlreadyBanned text={banned} />
      <Closing text={page.closing} newTab={dict.nav.newTab} />
    </>
  );
}
