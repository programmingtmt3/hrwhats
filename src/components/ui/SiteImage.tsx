import ExportedImage from "next-image-export-optimizer";
import type { ComponentProps } from "react";

/**
 * The only image component to use. Wraps next-image-export-optimizer's
 * ExportedImage with `placeholder="empty"`: the design shows no blur
 * placeholder (and a blurred background would show through transparent PNGs).
 */
export function SiteImage(props: ComponentProps<typeof ExportedImage>) {
  return <ExportedImage placeholder="empty" {...props} />;
}
