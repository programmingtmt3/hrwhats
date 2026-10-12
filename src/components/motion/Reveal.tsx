"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/*
 * Scroll reveal, same as the design's script: one shared IntersectionObserver
 * (threshold .12, rootMargin "0px 0px -40px 0px"); an element gets `.in-view`
 * the first time it intersects and is then unobserved. Styling lives in the
 * `.reveal` / `.in-view` classes in globals.css.
 */

type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  return observer;
}

const InViewContext = createContext(false);

/** True once the nearest <Reveal> ancestor has entered the viewport. */
export function useInView() {
  return useContext(InViewContext);
}

/** Observe an element once; returns its ref and whether it has entered the viewport. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    callbacks.set(el, () => setInView(true));
    io.observe(el);
    return () => {
      callbacks.delete(el);
      io.unobserve(el);
    };
  }, []);

  return [ref, inView] as const;
}

/** className/style for a revealing element: `.reveal`, `.in-view`, and the `--d` delay. */
export function revealProps(inView: boolean, className?: string, delay?: number, style?: CSSProperties) {
  return {
    className: cn("reveal", inView && "in-view", className),
    style: delay ? ({ ...style, "--d": `${delay}s` } as CSSProperties) : style,
  };
}

type RevealProps = {
  /** HTML tag name only (components can't cross the server/client boundary). */
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  /** Transition delay in seconds (the design's `--d`). */
  delay?: number;
  style?: CSSProperties;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "style" | "children">;

export function Reveal({ as: Tag = "div", className, delay, style, children, ...rest }: RevealProps) {
  const [ref, inView] = useReveal<HTMLElement>();
  const Element = Tag as ElementType;

  return (
    <Element ref={ref} {...revealProps(inView, className, delay, style)} {...rest}>
      <InViewContext.Provider value={inView}>{children}</InViewContext.Provider>
    </Element>
  );
}
