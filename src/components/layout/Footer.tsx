import Link from "next/link";

import {
  ChatBubbleIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons";
import { getSite, t, type SocialPlatform } from "@/lib/content";
import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";
import {
  getFooterGuideLinks,
  getFooterQuickLinks,
  getLegalLinks,
  type NavLink,
} from "@/lib/navigation";

import { BrandLogo } from "./BrandLogo";
import styles from "./Footer.module.css";

const socialIcons: Record<SocialPlatform, typeof XIcon> = {
  instagram: InstagramIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
};

function FooterLink({ link, locale }: { link: NavLink; locale: Locale }) {
  return link.external ? (
    <a href={link.href}>{link.label}</a>
  ) : (
    <Link href={localePath(locale, link.href)}>{link.label}</Link>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const site = getSite();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="site-container">
        <div className={styles.grid}>
          <div>
            <Link href={localePath(locale, "/")} className={styles.logo}>
              <BrandLogo sizes="44px" />
            </Link>
            <p>{dict.footer.description}</p>
            <div className={styles.social}>
              {site.social.map(({ platform, label, url }) => {
                const Icon = socialIcons[platform];
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener" aria-label={label}>
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4>{dict.footer.quickLinks}</h4>
            <ul>
              {getFooterQuickLinks(dict, site).map((link) => (
                <li key={link.href}>
                  <FooterLink link={link} locale={locale} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{dict.footer.guide}</h4>
            <ul>
              {getFooterGuideLinks(dict).map((link) => (
                <li key={link.href}>
                  <FooterLink link={link} locale={locale} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{dict.footer.contact}</h4>
            <ul>
              <li>
                <a className={styles.contactLi} href={site.contact.phone.href}>
                  <PhoneIcon />
                  <span dir="ltr">{site.contact.phone.display}</span>
                </a>
              </li>
              <li>
                <a className={styles.contactLi} href={`mailto:${site.contact.email}`}>
                  <MailIcon />
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  className={styles.contactLi}
                  href={site.contact.whatsapp.url}
                  target="_blank"
                  rel="noopener"
                >
                  <ChatBubbleIcon />
                  <span dir="ltr">{site.contact.whatsapp.display}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <div>
            {format(dict.footer.copyright, { year })} <b>{t(site.publisher.name, locale)}</b>
          </div>
          <div className={styles.pol}>
            {getLegalLinks(dict).map((link) => (
              <FooterLink key={link.href} link={link} locale={locale} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
