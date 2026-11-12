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
import { getSite, tRequired, type SocialPlatform } from "@/lib/content";
import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";
import {
  getFooterGuideLinks,
  getFooterQuickLinks,
  getLegalLinks,
  localizeLinks,
  type NavLink,
} from "@/lib/navigation";

import { NewTabLink } from "@/components/ui/NewTabLink";

import { BrandLogo } from "./BrandLogo";
import styles from "./Footer.module.css";

const socialIcons: Record<SocialPlatform, typeof XIcon> = {
  instagram: InstagramIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
};

/** `link` comes from localizeLinks: its href is final. */
function FooterLink({ link, locale }: { link: NavLink; locale: Locale }) {
  if (link.newTab) {
    return (
      <NewTabLink
        href={link.href}
        hrefLang={link.hrefLang}
        label={format(getDictionary(locale).nav.newTab, { label: link.label })}
      >
        {link.label}
      </NewTabLink>
    );
  }
  return link.external ? (
    <a href={link.href} hrefLang={link.hrefLang}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} hrefLang={link.hrefLang}>
      {link.label}
    </Link>
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
              {localizeLinks(locale, getFooterQuickLinks(dict, site)).map((link) => (
                <li key={link.href}>
                  <FooterLink link={link} locale={locale} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{dict.footer.guide}</h4>
            <ul>
              {localizeLinks(locale, getFooterGuideLinks(dict, site)).map((link) => (
                <li key={link.label}>
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
            {format(dict.footer.copyright, { year })} <b>{tRequired(site.publisher.name, locale)}</b>
          </div>
          <div className={styles.pol}>
            {localizeLinks(locale, getLegalLinks(dict)).map((link) => (
              <FooterLink key={link.href} link={link} locale={locale} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
