import { WhatsAppIcon } from "@/components/icons";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

import styles from "./WhatsAppFloat.module.css";

export function WhatsAppFloat({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <a
      href={getSite().contact.whatsapp.url}
      className={styles.waFloat}
      target="_blank"
      rel="noopener"
      aria-label={dict.waFloat.label}
    >
      <WhatsAppIcon />
    </a>
  );
}
