import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import styles from "@/components/contact/Contact.module.css";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/sections/PageHero";
import { getSite, getTurnstileSiteKey } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { breadcrumbJsonLd, contactPageJsonLd } from "@/lib/seo";

export function ContactPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.contactPage;
  const site = getSite();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [dict.nav.home, "/"],
          [dict.nav.contact, "/contact/"],
        ])}
      />
      <JsonLd data={contactPageJsonLd(locale, page.meta.title)} />
      <PageHero eyebrow={page.hero.eyebrow} title={page.hero.title} lead={page.hero.lead} />
      <section className={styles.section}>
        <div className={cn("site-container", styles.grid)}>
          <Reveal className={styles.formCard}>
            <ContactForm
              text={page.form}
              endpoint={site.contactEndpoint}
              siteKey={getTurnstileSiteKey()}
              whatsappUrl={site.contact.whatsapp.url}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ContactInfo text={page.info} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
