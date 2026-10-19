import type { ComponentType, ReactNode, SVGProps } from "react";
import { Share2 } from "lucide-react";

import {
  ChatBubbleIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons";
import { getSite, type SocialPlatform } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";

import styles from "./Contact.module.css";

const socialIcons: Record<SocialPlatform, ComponentType<SVGProps<SVGSVGElement>>> = {
  instagram: InstagramIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
};

function InfoCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className={styles.infoCard}>
      <span className={styles.infoIcon}>{icon}</span>
      <div>
        <span className={styles.infoLabel}>{label}</span>
        {children}
      </div>
    </li>
  );
}

export function ContactInfo({ text }: { text: Dictionary["contactPage"]["info"] }) {
  const { contact, social } = getSite();

  return (
    <ul className={styles.info}>
      <InfoCard icon={<PhoneIcon />} label={text.phone}>
        <a href={contact.phone.href} dir="ltr" className={styles.infoValue}>
          {contact.phone.display}
        </a>
      </InfoCard>
      <InfoCard icon={<MailIcon />} label={text.email}>
        <a href={`mailto:${contact.email}`} dir="ltr" className={styles.infoValue}>
          {contact.email}
        </a>
      </InfoCard>
      <InfoCard icon={<ChatBubbleIcon />} label={text.whatsapp}>
        <a href={contact.whatsapp.url} target="_blank" rel="noopener" dir="ltr" className={styles.infoValue}>
          {contact.whatsapp.display}
        </a>
      </InfoCard>
      <InfoCard icon={<Share2 aria-hidden="true" />} label={text.social}>
        <div className={styles.social}>
          {social.map(({ platform, label, url }) => {
            const Icon = socialIcons[platform];
            return (
              <a key={platform} href={url} target="_blank" rel="noopener" aria-label={label}>
                <Icon />
              </a>
            );
          })}
        </div>
      </InfoCard>
    </ul>
  );
}
