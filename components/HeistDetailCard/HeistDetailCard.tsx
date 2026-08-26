import { Calendar, User } from "lucide-react"
import type { Heist } from "@/types/firestore"
import {
  formatAbsoluteDeadline,
  formatRelativeDeadline,
  formatRelativeExpiry,
} from "@/lib/dateUtils"
import styles from "./HeistDetailCard.module.css"

interface HeistDetailCardProps {
  heist: Heist
  /** the clock expiry derivations must agree with — owned by the hook */
  now: Date
}

interface StatusDisplay {
  text: string
  className: string
}

function getStatusDisplay(
  finalStatus: Heist["finalStatus"],
  isExpired: boolean
): StatusDisplay {
  if (finalStatus === "success") {
    return { text: "Completed", className: styles.statusSuccess }
  }

  if (finalStatus === "failure" || isExpired) {
    return { text: "Failed", className: styles.statusFailure }
  }

  return { text: "In Progress", className: styles.statusInProgress }
}

export default function HeistDetailCard({ heist, now }: HeistDetailCardProps) {
  const isExpired = heist.deadline.getTime() <= now.getTime()
  const status = getStatusDisplay(heist.finalStatus, isExpired)

  return (
    <article className={styles.dossier}>
      <header className={styles.dossierBar}>
        <span>Mission dossier &middot; {heist.id}</span>
        <span className={status.className}>{status.text}</span>
      </header>
      <div className={styles.body}>
        <h2 className={styles.title}>{heist.title}</h2>
        <p className={styles.description}>{heist.description}</p>
        <dl className={styles.details}>
          <div className={styles.row}>
            <dt className={styles.label}>
              <User size={16} aria-hidden /> To:
            </dt>
            <dd className={styles.value}>
              <span className={styles.codename}>
                {heist.assignedToCodename}
              </span>
              <span className={styles.agentId}>{heist.assignedTo}</span>
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>
              <Calendar size={16} aria-hidden /> Deadline:
            </dt>
            <dd className={styles.value}>
              <span className={styles.relativeDeadline}>
                {isExpired
                  ? formatRelativeExpiry(heist.deadline, now)
                  : formatRelativeDeadline(heist.deadline, now)}
              </span>
              <span className={styles.absoluteDeadline}>
                {formatAbsoluteDeadline(heist.deadline)}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
