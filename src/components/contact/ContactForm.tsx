"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CircleAlert, CircleCheck } from "lucide-react";
import { z } from "zod";

import { WhatsAppIcon } from "@/components/icons";
import { CONTACT_LIMITS, submitContact } from "@/lib/contact-submit";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./Contact.module.css";
import { Turnstile } from "./Turnstile";

type FormText = Dictionary["contactPage"]["form"];

type ContactFormProps = {
  text: FormText;
  endpoint: string;
  siteKey: string;
  whatsappUrl: string;
};

type Status = "idle" | "sending" | "success" | "error";

function makeSchema(errors: FormText["errors"]) {
  return z.object({
    name: z.string().trim().min(1, errors.nameRequired).max(CONTACT_LIMITS.name, errors.nameTooLong),
    email: z
      .string()
      .trim()
      .min(1, errors.emailRequired)
      .max(CONTACT_LIMITS.email, errors.emailInvalid)
      .pipe(z.email(errors.emailInvalid)),
    subject: z.string().trim().min(1, errors.subjectRequired).max(CONTACT_LIMITS.subject, errors.subjectTooLong),
    message: z.string().trim().max(CONTACT_LIMITS.message, errors.messageTooLong),
    website: z.string(),
  });
}

type Values = z.infer<ReturnType<typeof makeSchema>>;
const EMPTY: Values = { name: "", email: "", subject: "", message: "", website: "" };

export function ContactForm({ text, endpoint, siteKey, whatsappUrl }: ContactFormProps) {
  const schema = useMemo(() => makeSchema(text.errors), [text.errors]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY, mode: "onTouched" });

  const [token, setToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setStatus("sending");
    const ok = await submitContact(endpoint, { ...values, token });
    setStatus(ok ? "success" : "error");
    if (ok) reset(EMPTY);
    // Turnstile tokens are single-use: get a fresh one either way.
    setResetSignal((n) => n + 1);
  });

  const sending = status === "sending";

  const field = (name: "name" | "email" | "subject", type: "text" | "email", autoComplete: string) => {
    const error = errors[name]?.message;
    const id = `contact-${name}`;
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{text[name]}</label>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          dir={type === "email" ? "ltr" : undefined}
          maxLength={CONTACT_LIMITS[name]}
          {...register(name, { onChange: () => status !== "sending" && setStatus("idle") })}
        />
        {error && (
          <p id={`${id}-error`} className={styles.error}>
            {error}
          </p>
        )}
      </div>
    );
  };

  const messageError = errors.message?.message;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-label={text.ariaLabel}>
      <div className={styles.row}>
        {field("name", "text", "name")}
        {field("email", "email", "email")}
      </div>
      {field("subject", "text", "off")}

      <div className={styles.field}>
        <label htmlFor="contact-message">
          {text.message} <span className={styles.optional}>{text.optional}</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          maxLength={CONTACT_LIMITS.message}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "contact-message-error" : undefined}
          {...register("message")}
        />
        {messageError && (
          <p id="contact-message-error" className={styles.error}>
            {messageError}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">{text.honeypot}</label>
        <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <Turnstile siteKey={siteKey} onToken={setToken} resetSignal={resetSignal} />

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={!token || sending}>
          {sending ? text.sending : text.submit}
        </button>
        {!token && !sending && <p className={styles.hint}>{text.captchaHint}</p>}
      </div>

      <div aria-live="polite">
        {status === "success" && (
          <p className={cn(styles.status, styles.success)}>
            <CircleCheck aria-hidden="true" />
            {text.success}
          </p>
        )}
        {status === "error" && (
          <div className={cn(styles.status, styles.failure)}>
            <CircleAlert aria-hidden="true" />
            <div>
              <p>{text.error}</p>
              <a href={whatsappUrl} target="_blank" rel="noopener" className={styles.statusLink}>
                <WhatsAppIcon aria-hidden="true" />
                {text.whatsappCta}
              </a>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
