"use client";

import { CheckCheck, RotateCcw, ShoppingCart } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

import { format } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./MiniShop.module.css";
import { ProductArt } from "./ProductArt";
import receipt from "./Receipt.module.css";

type Product = { id: string; name: string; price: number; priceText: string };

type Labels = {
  label: string;
  hint: string;
  sender: string;
  intro: string;
  time: string;
  add: string;
  addLabel: string;
  inCart: string;
  cart: string;
  cartCount: string;
  checkout: string;
  restart: string;
  confirmTitle: string;
  orderLabel: string;
  orderNumber: string;
  quantity: string;
  total: string;
  delivery: string;
  announceAdded: string;
  announceOrdered: string;
  announceRestart: string;
};

/*
 * A real, tiny shop inside a WhatsApp catalog message: add products, see the
 * cart count, check out to get a short invoice, start over. Nothing is stored
 * or sent anywhere. Every change is announced through the live region; focus
 * moves to the invoice after checkout and back to the first product after a
 * restart. Without JS the catalog simply shows as a static message.
 */
export function MiniShop({
  products,
  labels,
  priceTemplate,
  exampleTag,
}: {
  products: Product[];
  labels: Labels;
  priceTemplate: string;
  exampleTag: ReactNode;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ordered, setOrdered] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const invoiceRef = useRef<HTMLHeadingElement>(null);
  const firstAddRef = useRef<HTMLButtonElement>(null);

  const count = Object.values(cart).reduce((sum, n) => sum + n, 0);
  const lines = products.filter((p) => cart[p.id]);
  const total = lines.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  const money = (amount: number) => format(priceTemplate, { amount: amount.toLocaleString("en-US") });

  const add = (product: Product) => {
    const next = { ...cart, [product.id]: (cart[product.id] ?? 0) + 1 };
    setCart(next);
    const nextCount = Object.values(next).reduce((sum, n) => sum + n, 0);
    setAnnouncement(format(labels.announceAdded, { name: product.name, count: nextCount }));
  };

  const checkout = () => {
    setOrdered(true);
    setAnnouncement(format(labels.announceOrdered, { total: money(total) }));
    requestAnimationFrame(() => invoiceRef.current?.focus());
  };

  const restart = () => {
    setCart({});
    setOrdered(false);
    setAnnouncement(labels.announceRestart);
    requestAnimationFrame(() => firstAddRef.current?.focus());
  };

  return (
    <figure className={styles.shop} aria-label={labels.label}>
      <div className={styles.top}>
        <p className={styles.hint}>{labels.hint}</p>
        {exampleTag}
      </div>

      {/* Catalog message */}
      <div className={styles.message}>
        <div className={styles.sender}>
          <b>{labels.sender}</b>
          <time>{labels.time}</time>
        </div>
        <p>{labels.intro}</p>
        <ul className={styles.products}>
          {products.map((product, i) => (
            <li key={product.id}>
              <ProductArt id={product.id} className={styles.art} />
              <span className={styles.info}>
                <b>{product.name}</b>
                <span>{product.priceText}</span>
                {cart[product.id] ? <small>{format(labels.inCart, { count: cart[product.id] })}</small> : null}
              </span>
              <button
                ref={i === 0 ? firstAddRef : undefined}
                type="button"
                className={styles.add}
                onClick={() => add(product)}
                disabled={ordered}
                aria-label={format(labels.addLabel, { name: product.name })}
              >
                {labels.add}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Cart bar */}
      <div className={styles.cartBar}>
        <span className={styles.cart}>
          <ShoppingCart aria-hidden="true" />
          {labels.cart}
          {/* Re-keyed on every change so the badge bumps once per add. */}
          <span key={count} className={cn(styles.badge, count > 0 && styles.bump)}>
            {count}
            <span className="sr-only">{format(labels.cartCount, { count })}</span>
          </span>
        </span>
        <button type="button" className={styles.checkout} onClick={checkout} disabled={count === 0 || ordered}>
          {labels.checkout}
        </button>
      </div>

      {/* Confirmation with a short invoice */}
      {ordered && (
        <div className={cn(styles.message, styles.confirm)}>
          <h3 ref={invoiceRef} tabIndex={-1} className={styles.confirmTitle}>
            {labels.confirmTitle}
          </h3>
          <div className={cn(receipt.zigzagBottom, styles.invoice)}>
            <p className={styles.row}>
              <span>{labels.orderLabel}</span>
              <bdi>{labels.orderNumber}</bdi>
            </p>
            <hr className={receipt.rule} />
            {lines.map((p) => (
              <p key={p.id} className={styles.row}>
                <span>
                  {p.name}
                  <small>{format(labels.quantity, { count: cart[p.id] })}</small>
                </span>
                <span>{money(p.price * cart[p.id])}</span>
              </p>
            ))}
            <hr className={receipt.rule} />
            <p className={cn(styles.row, styles.total)}>
              <span>{labels.total}</span>
              <span>{money(total)}</span>
            </p>
          </div>
          <p className={styles.delivery}>{labels.delivery}</p>
          <span className={styles.read} aria-hidden="true">
            <CheckCheck />
          </span>
          <button type="button" className={styles.restart} onClick={restart}>
            <RotateCcw aria-hidden="true" />
            {labels.restart}
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </figure>
  );
}
