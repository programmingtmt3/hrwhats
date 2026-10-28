import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import styles from "./Shelves.module.css";
import { Bestsellers, CareFollowUp, PickupOrder, ProductSheet, SalesTeam, ShelfCard, WindowOffer } from "./Visuals";

type Shops = Dictionary["sectors"]["shops"];
type ServiceKey = keyof Shops["services"]["items"];

const KEYS: ServiceKey[] = ["inquiries", "catalog", "orders", "campaigns", "experience", "team", "reports"];

function visualFor(key: ServiceKey, page: Shops): ReactNode {
  const { visuals } = page.services;
  const tag = <ExampleTag>{page.exampleTag}</ExampleTag>;
  const money = (amount: number) => format(page.price, { amount: amount.toLocaleString("en-US") });

  switch (key) {
    case "inquiries":
      return <ShelfCard data={visuals.shelf} price={money(visuals.shelf.price)} exampleTag={tag} />;
    case "catalog":
      return <ProductSheet data={visuals.sheet} money={money} exampleTag={tag} />;
    case "orders":
      return <PickupOrder data={visuals.orders} price={money(visuals.orders.price)} exampleTag={tag} />;
    case "campaigns":
      return <WindowOffer data={visuals.window} exampleTag={tag} />;
    case "experience":
      return <CareFollowUp data={visuals.care} exampleTag={tag} />;
    case "team":
      return <SalesTeam data={visuals.team} exampleTag={tag} />;
    case "reports":
      return <Bestsellers data={visuals.bestsellers} exampleTag={tag} />;
    default:
      return null;
  }
}

/*
 * The seven services on shop shelves: each mockup stands on a wooden shelf and
 * its text hangs beside it on a price tag (hole + string). Phones: the tag
 * comes first, then the shelf.
 */
export function Shelves({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.shops;
  const { services } = page;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />
        <div className={styles.rows}>
          {KEYS.map((key) => (
            <div key={key} className={styles.row}>
              <Reveal className={styles.tagCol}>
                <div className={styles.priceTag}>
                  <span className={styles.string} aria-hidden="true" />
                  <FeatureItem feature={services.items[key]} heading="h3" plain />
                </div>
              </Reveal>
              <Reveal className={styles.shelf} delay={0.1}>
                <div className={styles.onShelf}>{visualFor(key, page)}</div>
                <span className={styles.plank} aria-hidden="true" />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
