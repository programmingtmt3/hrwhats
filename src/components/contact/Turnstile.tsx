"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<TurnstileApi> | null = null;

/** Load Cloudflare's script once, only when a widget is about to be shown. */
function loadTurnstile(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing")));
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile script failed"));
    };
    document.head.append(script);
  });
  return scriptPromise;
}

type TurnstileProps = {
  siteKey: string;
  /** Token when solved; null when expired, errored or reset. */
  onToken: (token: string | null) => void;
  /** Change this number to reset the widget (tokens are single-use). */
  resetSignal: number;
};

export function Turnstile({ siteKey, onToken, resetSignal }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  // Render once the container is near the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        loadTurnstile()
          .then((turnstile) => {
            if (cancelled || widgetRef.current) return;
            widgetRef.current = turnstile.render(el, {
              sitekey: siteKey,
              language: "ar",
              theme: "light",
              size: "flexible",
              callback: (token: string) => onTokenRef.current(token),
              "expired-callback": () => onTokenRef.current(null),
              "error-callback": () => onTokenRef.current(null),
            });
          })
          .catch(() => onTokenRef.current(null));
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal > 0 && widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      onTokenRef.current(null);
    }
  }, [resetSignal]);

  return <div ref={containerRef} />;
}
