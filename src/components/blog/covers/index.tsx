import type { ComponentType } from "react";

import type { Post } from "@/lib/content";
import { cn } from "@/lib/utils";

import { BanProtectionCover } from "./BanProtectionCover";
import styles from "./PostCover.module.css";

type CoverProps = { variant: number; animated: boolean };

/*
 * One code-drawn cover per kind of post. To add a template: draw its component,
 * register it here, and add its name to COVER_TEMPLATES in velite.config.ts.
 */
const COVERS: Record<Post["cover"]["template"], ComponentType<CoverProps>> = {
  "ban-protection": BanProtectionCover,
};

export function PostCover({
  cover,
  animated = false,
  className,
}: {
  cover: Post["cover"];
  animated?: boolean;
  className?: string;
}) {
  const Cover = COVERS[cover.template];
  return (
    <div className={cn(styles.frame, className)}>
      <Cover variant={cover.variant} animated={animated} />
    </div>
  );
}
