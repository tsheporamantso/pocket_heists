import styles from "./Skeleton.module.css"

export default function Skeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div className={styles.avatar} />
        <div className={styles.lines}>
          <div className={`${styles.line} ${styles.lineShort}`} />
          <div className={`${styles.line} ${styles.lineMedium}`} />
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={`${styles.line} ${styles.lineLong}`} />
        <div className={`${styles.line} ${styles.lineLong}`} />
        <div className={`${styles.line} ${styles.lineMedium}`} />
      </div>
    </div>
  )
}
