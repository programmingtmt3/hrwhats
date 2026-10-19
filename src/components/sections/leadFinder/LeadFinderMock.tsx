import type { CSSProperties } from "react";
import { Check, FileDown, MapPin, Phone, Search, Sparkles, Store } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";

import styles from "./LeadFinder.module.css";

type MockText = Dictionary["home"]["leadFinder"]["mock"];

/**
 * Illustrative app window (not a real form). Exposed to assistive tech as a
 * single image with a description; result rows appear one after another once
 * the parent <Reveal> is in view (.reveal-child).
 */
export function LeadFinderMock({ mock }: { mock: MockText }) {
  return (
    <div className={styles.window} role="img" aria-label={mock.ariaLabel}>
      <div className={styles.bar} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className={styles.body} aria-hidden="true">
        <div className={styles.mockTitle}>
          <MapPin />
          {mock.title}
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <small>{mock.activityLabel}</small>
            <span className={styles.input}>{mock.activityValue}</span>
          </div>
          <div className={styles.field}>
            <small>{mock.locationLabel}</small>
            <span className={styles.input}>{mock.locationValue}</span>
          </div>
          <span className={styles.searchBtn}>
            <Search />
            {mock.search}
          </span>
        </div>

        <div className={styles.option}>
          <span className={styles.checkbox}>
            <Check strokeWidth={3} />
          </span>
          {mock.expand}
          <span className={styles.aiBadge}>
            <Sparkles />
            {mock.aiBadge}
          </span>
        </div>

        <ul className={styles.results}>
          {mock.results.map((result, i) => (
            <li
              key={result.name}
              className={`${styles.result} reveal-child`}
              style={{ "--i": i, "--stagger-start": "0.5s" } as CSSProperties}
            >
              <span className={styles.store}>
                <Store />
              </span>
              <span className={styles.info}>
                <b>{result.name}</b>
                <span>
                  <MapPin />
                  {result.district}
                </span>
              </span>
              <span className={styles.phone}>
                <Phone />
              </span>
              <span className={styles.added}>
                <Check strokeWidth={3} />
                {mock.added}
              </span>
            </li>
          ))}
        </ul>

        <div
          className={`${styles.footer} reveal-child`}
          style={{ "--i": mock.results.length, "--stagger-start": "0.5s" } as CSSProperties}
        >
          <span>{mock.count}</span>
          <span className={styles.exportBtn}>
            <FileDown />
            {mock.export}
          </span>
        </div>
      </div>
    </div>
  );
}
