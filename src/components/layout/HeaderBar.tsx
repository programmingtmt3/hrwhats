"use client";

import { ArrowUpLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

import { NewTabLink } from "@/components/ui/NewTabLink";
import { format } from "@/lib/format";
import type { NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import styles from "./Header.module.css";

type HeaderBarProps = {
  logo: ReactNode;
  homeHref: string;
  /** Internal links (already locale-prefixed) and the usage guide (external, new tab). */
  items: NavLink[];
  labels: { logo: string; dashboard: string; signup: string; menu: string; newTab: string };
  urls: { login: string; signup: string };
  /** Extra controls before the CTAs (language switcher in the English phase). */
  extra?: ReactNode;
};

const MENU_ID = "site-menu";

/** Compare paths ignoring the trailing slash (/packages vs /packages/). */
const samePath = (a: string, b: string) => a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

export function HeaderBar({ logo, homeHref, items, labels, urls, extra }: HeaderBarProps) {
  const pathname = usePathname();
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
        </ul>

        <div className={styles.navCta}>
          {extra}
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
