import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import { CartRecovery } from "./CartRecovery";
import { CompareSlider } from "./CompareSlider";
import { InquiryFilters } from "./InquiryFilters";
import styles from "./Services.module.css";
import { BotSuggest, Heatmap, PrintedInvoice, Tracking } from "./Visuals";

type Stores = Dictionary["sectors"]["stores"];
type ServiceKey = keyof Stores["services"]["items"];

/** Services on the receipt, before and after the abandoned-cart spotlight. */
const BEFORE: ServiceKey[] = ["inquiries", "autoReplies", "orders"];
const AFTER: ServiceKey[] = ["experience", "reports"];

function visualFor(key: ServiceKey, page: Stores): ReactNode {
  const { visuals } = page.services;
  const tag = <ExampleTag>{page.exampleTag}</ExampleTag>;
  const money = (amount: number) => format(page.price, { amount: amount.toLocaleString("en-US") });

  switch (key) {
    case "inquiries":
      return <InquiryFilters data={visuals.inquiries} exampleTag={tag} />;
    case "autoReplies":
      return <BotSuggest data={visuals.autoReplies} price={money(visuals.autoReplies.product.price)} exampleTag={tag} />;
    case "orders": {
      const { lines } = visuals.orders;
      return (
        <PrintedInvoice
          data={visuals.orders}
          lines={lines.map((line) => ({ name: line.name, price: money(line.price) }))}
          total={money(lines.reduce((sum, line) => sum + line.price, 0))}
          exampleTag={tag}
        />
      );
    }
    case "experience":
      return (
        <>
          <CompareSlider data={visuals.experience} exampleTag={tag} />
          <Tracking data={visuals.experience} />
        </>
      );
    case "reports":
      return <Heatmap data={visuals.reports} exampleTag={tag} />;
    default:
      return null;
  }
}

/** One receipt strip: service text on the paper, its mockup beside it (same side every time). */
function ReceiptStrip({ keys, page }: { keys: ServiceKey[]; page: Stores }) {
  return (
    <div className={styles.receipt}>
      {keys.map((key, i) => (
        <div key={key} className={styles.row}>
          <Reveal className={cn(styles.line, i === 0 && styles.first, i === keys.length - 1 && styles.last)}>
            <FeatureItem feature={page.services.items[key]} heading="h3" plain />
          </Reveal>
          <Reveal className={styles.visual} delay={0.1}>
            {visualFor(key, page)}
          </Reveal>
        </div>
      ))}
    </div>
  );
}

export function Services({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.stores;
  const { services } = page;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />
        <ReceiptStrip keys={BEFORE} page={page} />
      </div>

      <CartRecovery
        feature={services.items.campaigns}
        data={services.visuals.campaigns}
        exampleTag={<ExampleTag>{page.exampleTag}</ExampleTag>}
      />

      <div className="site-container">
        <ReceiptStrip keys={AFTER} page={page} />
      </div>
    </section>
  );
}
