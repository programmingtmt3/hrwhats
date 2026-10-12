import Link from "next/link";

import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";
import { getLegalLinks, getMainNav, type NavLink } from "@/lib/navigation";
import { DEVELOPER_URL } from "@/lib/site";

import { Logo } from "./Logo";

function FooterLinks({ title, links, locale }: { title: string; links: NavLink[]; locale: Locale }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              href={localePath(locale, link.path)}
              className="text-muted-foreground hover:text-primary hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  // Top-level links only; dropdown groups are reachable from the header.
  const quickLinks = getMainNav(dict).filter((item): item is NavLink => "path" in item);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-3 lg:col-span-2">
          <Logo locale={locale} className="size-20" />
          <p className="max-w-sm text-muted-foreground">{dict.footer.tagline}</p>
        </div>
        <FooterLinks title={dict.footer.quickLinks} links={quickLinks} locale={locale} />
        <FooterLinks title={dict.footer.legalLinks} links={getLegalLinks(dict)} locale={locale} />
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>{format(dict.footer.copyright, { year })}</p>
          <a href={DEVELOPER_URL} target="_blank" rel="noopener" className="hover:text-primary hover:underline">
            {dict.footer.developedBy}
          </a>
        </div>
      </div>
    </footer>
  );
}
