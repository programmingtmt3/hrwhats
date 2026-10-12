/**
 * Icons copied verbatim from the design reference (design/index.html) so the
 * rendering matches exactly. Decorative by default (aria-hidden).
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Stroke({ strokeWidth = 2, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function Fill({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

/* ---------- Social ---------- */

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3zm-1.2 18h1.7L6.4 3.9H4.6z" />
    </Fill>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9L15.5 12z" />
    </Fill>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM12 0a12 12 0 0 0-10.3 18L0 24l6.2-1.6A12 12 0 1 0 12 0z" />
    </Fill>
  );
}

/* ---------- Contact ---------- */

export function PhoneIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </Stroke>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </Stroke>
  );
}

export function ChatBubbleIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z" />
    </Stroke>
  );
}

/* ---------- Hero & trust bar ---------- */

/** Points left (forward in RTL). Add `icon-forward` to flip it in LTR. */
export function ArrowIcon({ strokeWidth = 2.2, ...props }: IconProps) {
  return (
    <Stroke strokeWidth={strokeWidth} {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </Stroke>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Stroke strokeWidth={2.5} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Stroke>
  );
}

export function VerifiedIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M12 1l2.6 2.1 3.3-.4.9 3.2 2.9 1.7-1.2 3.1 1.2 3.1-2.9 1.7-.9 3.2-3.3-.4L12 23l-2.6-2.1-3.3.4-.9-3.2-2.9-1.7 1.2-3.1-1.2-3.1 2.9-1.7.9-3.2 3.3.4z" />
      <path d="M10.5 15.5 7 12l1.4-1.4 2.1 2.1 5.1-5.1L17 9z" style={{ fill: "var(--wa-teal)" }} />
    </Fill>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M3 20.5v-6l8-2.5-8-2.5v-6L22 12z" transform="scale(-1,1) translate(-24,0)" />
    </Fill>
  );
}

export function PaperPlaneIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
    </Stroke>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 8V4H8" />
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
    </Stroke>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
    </Stroke>
  );
}

export function CalendarCheckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
    </Stroke>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Stroke>
  );
}

/* ---------- Features (bento) ---------- */

export function CodeIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </Stroke>
  );
}

export function TrendIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 6-6" />
      <path d="M15 8h5v5" />
    </Stroke>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" />
    </Stroke>
  );
}

export function MegaphoneIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </Stroke>
  );
}

export function UserPlusIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </Stroke>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Stroke>
  );
}

export function LayoutIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Stroke>
  );
}

/* ---------- Why ---------- */

export function FileCheckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13l3 3 5-5" />
    </Stroke>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 13h5" />
    </Stroke>
  );
}

export function PulseIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Stroke>
  );
}

/* ---------- FAQ ---------- */

export function PlusIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
