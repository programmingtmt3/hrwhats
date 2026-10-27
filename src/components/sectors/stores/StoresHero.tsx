import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { MiniShop } from "./MiniShop";
import receipt from "./Receipt.module.css";
import styles from "./StoresHero.module.css";

export function StoresHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag, price } = getDictionary(locale).sectors.stores;
  const site = getSite();
  const { products, ...labels } = hero.shop;

  // Prices are formatted on the server; the shop only adds them up.
  const priced = products.map((p) => ({ ...p, priceText: format(price, { amount: p.price.toLocaleString("en-US") }) }));

  return (
    <section className={cn(receipt.zigzagBottom, styles.hero)}>
      <div className={cn("site-container", styles.grid)}>
        <Reveal className={styles.copy}>
          <span className="eyebrow">{eyebrow}</span>
          <h1>
            {hero.title.before}
            <span className="grad">{hero.title.highlight}</span>
            {hero.title.after}
          </h1>
          <p className={styles.lead}>{hero.lead}</p>
          <div className="hero-actions">
            <a href={site.appUrls.signup} className="btn btn-primary">
              {hero.primaryCta}
              <ArrowIcon className="icon-forward" />
            </a>
            <a href={site.contact.whatsapp.url} className="btn btn-ghost" target="_blank" rel="noopener">
              <WhatsAppIcon />
              {hero.salesCta}
            </a>
          </div>
        </Reveal>

        <Reveal className={styles.visual} delay={0.15}>
          <MiniShop products={priced} labels={labels} priceTemplate={price} exampleTag={<ExampleTag>{exampleTag}</ExampleTag>} />
        </Reveal>
      </div>
    </section>
  );
}
