import styles from "./HeistCardSkeleton.module.css"

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card} role="status" aria-label="Loading heist card">
      <div className={styles.titleLine} />
      <div className={styles.details}>
        <div className={styles.deadlineLine} />
        <div className={styles.deadlineLineShort} />
        <div className={styles.assigneeLine} />
        <div className={styles.statusLine} />
      </div>
    </div>
  )
}