import { Reveal } from "@/components/motion/Reveal";
import { SiteImage } from "@/components/ui/SiteImage";
import { getClients, getPartners, t, type Client, type Localized } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../SectionHeading";
import styles from "./Partners.module.css";

/** A logo name with no official English form stays Arabic (docs/en-glossary.md 4.4): mark it. */
function nameLang(name: Localized, locale: Locale): "ar" | undefined {
  return locale !== "ar" && !name[locale] ? "ar" : undefined;
}

function LogoPill({ client, locale, hidden }: { client: Client; locale: Locale; hidden?: boolean }) {
  const name = t(client.name, locale);
  return (
    <div
      className={styles.pill}
      title={hidden ? undefined : name}
      aria-hidden={hidden || undefined}
      lang={nameLang(client.name, locale)}
    >
      <SiteImage
        src={client.logo.src}
        width={client.logo.width}
        height={client.logo.height}
        alt={hidden ? "" : name}
        sizes="120px"
      />
    </div>
  );
}

/** One marquee row. The list is rendered twice for a seamless loop; the copy is hidden from assistive tech. */
function Marquee({ clients, locale, reverse }: { clients: Client[]; locale: Locale; reverse?: boolean }) {
  return (
    <Reveal className={cn(styles.marquee, reverse && styles.rev)}>
      <div className={styles.track}>
        {clients.map((client) => (
          <LogoPill key={client.logo.src} client={client} locale={locale} />
        ))}
        {clients.map((client) => (
          <LogoPill key={`copy-${client.logo.src}`} client={client} locale={locale} hidden />
        ))}
      </div>
    </Reveal>
  );
}

export function Partners({ locale }: { locale: Locale }) {
  const { partners: heading } = getDictionary(locale).home;
  const clients = getClients();
  // Split into two rows as in the design (first row gets the extra item).
  const half = Math.ceil(clients.length / 2);

  return (
    <section className={styles.partners} id="partners">
      <div className="site-container">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} lead={heading.lead} />
        <Reveal className={styles.row}>
          {getPartners(locale).map((partner) => {
            const name = t(partner.name, locale);
            return (
              <div
                key={partner.logo.src}
                className={styles.partner}
                title={name}
                lang={nameLang(partner.name, locale)}
              >
                <SiteImage
                  src={partner.logo.src}
                  width={partner.logo.width}
                  height={partner.logo.height}
                  alt={name}
                  sizes="160px"
                />
              </div>
            );
          })}
        </Reveal>
      </div>
      <Marquee clients={clients.slice(0, half)} locale={locale} />
      <Marquee clients={clients.slice(half)} locale={locale} reverse />
    </section>
  );
}
