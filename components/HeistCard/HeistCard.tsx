"use client";

import Link from "next/link";
import { Calendar, User, Users } from "lucide-react";
import type { Heist } from "@/types/firestore";
import {
  formatRelativeDeadline,
  formatAbsoluteDeadline,
  formatRelativeExpiry,
} from "@/lib/dateUtils";
import styles from "./HeistCard.module.css";

interface HeistCardProps {
  heist: Heist;
  variant?: "active" | "expired";
}

function getStatusDisplay(finalStatus: Heist["finalStatus"]) {
  switch (finalStatus) {
    case "success":
      return { text: "Completed", className: styles.statusSuccess };
    case "failure":
      return { text: "Failed", className: styles.statusFailure };
    default:
      return { text: "In Progress", className: styles.statusInProgress };
  }
}

export default function HeistCard({ heist, variant = "active" }: HeistCardProps) {
  const isExpired = variant === "expired";
  const { text: statusText, className: statusClassName } = getStatusDisplay(
    heist.finalStatus,
  );

  return (
    <article
      data-variant={variant}
      className={isExpired ? styles.card : `${styles.card} ${styles.cardInteractive}`}
    >
      <Link href={`/heists/${heist.id}`} className={styles.titleLink}>
        <h3 className={styles.title}>{heist.title}</h3>
      </Link>
      <div className={styles.details}>
        <div className={styles.assignee}>
          <span className={styles.label}>
            <User size={16} aria-hidden /> To:
          </span>
          <span className={styles.assigneeName}>
            {heist.assignedToCodename}
          </span>
        </div>
        <div className={styles.assignee}>
          <span className={styles.label}>
            <Users size={16} aria-hidden /> By:
          </span>
          <span className={styles.assigneeName}>{heist.createdByCodename}</span>
        </div>
        <div className={styles.deadline}>
          <span className={styles.relativeDeadline}>
            <Calendar size={14} aria-hidden />
            {isExpired
              ? formatRelativeExpiry(heist.deadline)
              : formatRelativeDeadline(heist.deadline)}
          </span>
          <span className={styles.absoluteDeadline}>
            {formatAbsoluteDeadline(heist.deadline)}
          </span>
        </div>
        <div className={styles.status}>
          <span className={statusClassName}>{statusText}</span>
        </div>
      </div>
    </article>
  );
}
