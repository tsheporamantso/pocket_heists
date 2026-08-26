import { Clock8, Facebook, Github, Instagram } from "lucide-react";
import Link from "next/link";
import styles from "./Footer.module.css";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/tsheporamantso", Icon: Github },
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href="/" className={styles.brand} aria-label="Pocket Heist">
            <span className={styles.wordmark}>
              P
              <Clock8
                className={styles.logo}
                size={14}
                strokeWidth={2.75}
                aria-hidden
              />
              cket Heist
            </span>
            <span className={styles.tagline}>
              Tiny missions. Big office mischief.
            </span>
          </Link>
          <ul className={styles.socials} aria-label="Social profiles">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  className={styles.social}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <Icon size={16} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.copyright}>
          © {year} Tshepo Ramantso. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
