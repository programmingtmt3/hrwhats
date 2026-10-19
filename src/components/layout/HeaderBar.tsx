"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import type { NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import styles from "./Header.module.css";

type HeaderBarProps = {
  logo: ReactNode;
  homeHref: string;
  /** Internal links, already locale-prefixed. */
  items: NavLink[];
  labels: { logo: string; dashboard: string; signup: string; menu: string };
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled, open && styles.open)}>
      <div className={cn("site-container", styles.nav)}>
        <Link href={homeHref} className={styles.logo} aria-label={labels.logo} onClick={close}>
          {logo}
        </Link>

        <ul className={styles.menu} id={MENU_ID}>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={samePath(pathname, item.href) ? "page" : undefined}
                onClick={close}
              >
                {item.label}
              </Link>
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
