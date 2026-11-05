import Link from "next/link";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import * as runtime from "react/jsx-runtime";

import { getDictionary, type Locale } from "@/lib/i18n";

import styles from "./Post.module.css";

type MdxContent = (props: { components: Record<string, ComponentType<never>> }) => ReactNode;

/** Internal links go through next/link; everything else opens in a new tab. */
function PostLink({ href = "", children }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Velite compiles each post at build time; this only evaluates that compiled body. */
export function PostBody({ code, locale }: { code: string; locale: Locale }) {
  const { tableLabel } = getDictionary(locale).blog;
  const Content = new Function(code)(runtime).default as MdxContent;

  const PostTable = (props: ComponentProps<"table">) => (
    // A wide table scrolls inside this box; focusable so the keyboard can scroll it too.
    <div className={styles.tableWrap} role="region" aria-label={tableLabel} tabIndex={0}>
      <table {...props} />
    </div>
  );

  return (
    <article id="post-body" className={styles.prose}>
      {Content({
        components: {
          a: PostLink as ComponentType<never>,
          table: PostTable as ComponentType<never>,
        },
      })}
    </article>
  );
}
