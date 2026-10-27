import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./ExampleTag.module.css";

/** Small "illustrative example" label shown on every mockup built in code. */
export function ExampleTag({ dark, className, children }: { dark?: boolean; className?: string; children: ReactNode }) {
  return <span className={cn(styles.tag, dark && styles.dark, className)}>{children}</span>;
}
