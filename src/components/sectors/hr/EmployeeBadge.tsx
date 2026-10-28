import { cn } from "@/lib/utils";

import styles from "./EmployeeBadge.module.css";

type Badge = {
  label: string;
  company: string;
  name: string;
  role: string;
  department: string;
  idLabel: string;
  id: string;
};

/** 7×7 decorative code pattern (not a real QR code). */
const CODE = "1110111100100110101011011101001001011101101110100100111011101100111110001".slice(0, 49);

/** An employee ID card built in code; `strap` hangs it from a lanyard. */
export function EmployeeBadge({ data, strap, className }: { data: Badge; strap?: boolean; className?: string }) {
  return (
    <div className={cn(styles.badge, strap && styles.withStrap, className)}>
      {strap && <span className={styles.strap} aria-hidden="true" />}
      <span className={styles.clip} aria-hidden="true" />
      <figure className={styles.card} aria-label={data.label}>
        <span className={styles.slot} aria-hidden="true" />
        <p className={styles.company}>{data.company}</p>
        <span className={styles.photo} aria-hidden="true">
          {data.name.charAt(0)}
        </span>
        <p className={styles.name}>{data.name}</p>
        <p className={styles.role}>{data.role}</p>
        <p className={styles.department}>{data.department}</p>
        <div className={styles.footer}>
          <span className={styles.id}>
            <small>{data.idLabel}</small>
            <b dir="ltr">{data.id}</b>
          </span>
          <span className={styles.code} aria-hidden="true">
            {CODE.split("").map((bit, i) => (
              <i key={i} className={cn(bit === "1" && styles.on)} />
            ))}
          </span>
        </div>
      </figure>
    </div>
  );
}
