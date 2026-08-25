import { Clock8 } from "lucide-react"
import styles from "./Footer.module.css"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.wordmark} role="img" aria-label="Pocket Heist">
          P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} aria-hidden />
          cket Heist
        </p>
        <p className={styles.copyright}>© {year} Pocket Heist</p>
      </div>
    </footer>
  )
}
