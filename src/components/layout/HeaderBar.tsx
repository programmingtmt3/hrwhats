"use client";

import { ArrowUpLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

import { NewTabLink } from "@/components/ui/NewTabLink";
import { format } from "@/lib/format";
import type { Locale } from "@/lib/locales";
import type { NavLink } from "@/lib/navigation";
import { counterpartHref } from "@/lib/translations";
import { cn } from "@/lib/utils";

import styles from "./Header.module.css";
import { LanguageSwitcher } from "./LanguageSwitcher";

type HeaderBarProps = {
  logo: ReactNode;
  homeHref: string;
  /** Internal links (already locale-prefixed) and the usage guide (external, new tab). */
  items: NavLink[];
  labels: { logo: string; dashboard: string; signup: string; menu: string; newTab: string };
  urls: { login: string; signup: string };
  /** Language switcher, when the other language is published. */
  languageSwitch?: { from: Locale; to: Locale; label: string };
};

const MENU_ID = "site-menu";

/** Compare paths ignoring the trailing slash (/packages vs /packages/). */
const samePath = (a: string, b: string) => a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

export function HeaderBar({ logo, homeHref, items, labels, urls, languageSwitch }: HeaderBarProps) {
  const pathname = usePathname();
  // Same page in the other language if it exists, otherwise that language's home.
  const switcher = languageSwitch && {
    href: counterpartHref(languageSwitch.from, languageSwitch.to, pathname),
    label: languageSwitch.label,
    hrefLang: languageSwitch.to,
  };
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // New-tab link clicked with the mouse: no hover style until the pointer leaves it, so
  // it doesn't look like the current page when the visitor comes back to this tab.
  const [leftTab, setLeftTab] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);
  const openNewTab = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    close();
    // Mouse/touch only (keyboard activation has detail 0 and keeps its focus).
    if (event.detail > 0) {
      setLeftTab(href);
      event.currentTarget.blur();
    }
  };

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled, open && styles.open)}>
      <div className={cn("site-container", styles.nav)}>
        <Link href={homeHref} className={styles.logo} aria-label={labels.logo} onClick={close}>
          {logo}
        </Link>

        <ul className={styles.menu} id={MENU_ID}>
          {items.map((item) => (
            <li key={item.href}>
              {item.newTab ? (
                <NewTabLink
                  href={item.href}
                  label={format(labels.newTab, { label: item.label })}
                  hrefLang={item.hrefLang}
                  className={cn(styles.ext, leftTab === item.href && styles.noHover)}
                  onClick={openNewTab(item.href)}
                  onPointerLeave={() => setLeftTab(null)}
                >
                  {item.label}
                  <ArrowUpLeft className={cn("icon-forward", styles.extIcon)} aria-hidden="true" />
                </NewTabLink>
              ) : (
                <Link
                  href={item.href}
                  hrefLang={item.hrefLang}
                  aria-current={samePath(pathname, item.href) ? "page" : undefined}
                  onClick={close}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          <li className={styles.mOnly}>
            <a href={urls.login} onClick={close}>
              {labels.dashboard}
            </a>
          </li>
          {switcher && (
            <li className={styles.mOnly}>
              <LanguageSwitcher {...switcher} className={styles.langLink} onClick={close} />
            </li>
          )}
        </ul>

        <div className={styles.navCta}>
          {switcher && <LanguageSwitcher {...switcher} className={styles.dOnly} />}
          <a href={urls.login} className="btn btn-ghost btn-sm">
            {labels.dashboard}
          </a>
          <a href={urls.signup} className="btn btn-primary btn-sm">
            {labels.signup}
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-label={labels.menu}
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
