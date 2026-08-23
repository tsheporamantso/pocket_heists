// welcome page for visitors without an account — register is the primary action

import Link from "next/link";
import { Clock8 } from "lucide-react";
import styles from "./page.module.css";

const STEPS = [
  {
    num: "01",
    title: "Scope the office",
    text: "Cameras, desks, and the good snack drawer — all mapped.",
  },
  {
    num: "02",
    title: "Recruit your crew",
    text: "Pick specialists who cover your plan's blind spots.",
  },
  {
    num: "03",
    title: "Get out clean",
    text: "In and out before anyone thinks to look up.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-lvh w-full max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <p className="text-lg font-bold tracking-tight">
          P<Clock8 className="inline align-[-2px]" size={16} strokeWidth={2.75} />
          cket Heist
        </p>
        <Link
          href="/login"
          className="rounded-lg border border-lighter px-4 py-2 font-semibold transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Log in
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center py-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-body">
          Mission file · recruitment open
        </p>
        <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Pull off the perfect{" "}
          <span className={styles.gradientWord}>tiny heist</span>.
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed">
          Pocket Heist is a game of small-scale office mischief. Pick a target,
          recruit your crew, and slip out with the loot before anyone notices
          it&apos;s gone.
        </p>
        <div className="mt-8">
          <Link href="/signup" className={styles.registerBtn}>
            Register
          </Link>
        </div>

        <section aria-label="Mission briefing" className={`${styles.panel} mt-16`}>
          <div className={styles.panelBar}>
            <span>Briefing — office plan</span>
            <span>Floor 3 · 02:00 AM</span>
          </div>
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr,240px]">
            <div className={`${styles.blueprint} rounded-lg`}>
              <svg
                viewBox="0 0 340 210"
                role="img"
                aria-label="Office floorplan showing an infiltration route from the door to the vault"
                className="h-auto w-full"
              >
                {/* walls */}
                <rect
                  x="10"
                  y="10"
                  width="320"
                  height="190"
                  rx="8"
                  fill="none"
                  stroke="rgba(153,161,175,0.4)"
                  strokeWidth="1.5"
                />
                {/* door gap + swing */}
                <rect x="7" y="140" width="7" height="34" fill="var(--color-dark)" />
                <path
                  d="M10 140 A34 34 0 0 1 44 172"
                  fill="none"
                  stroke="rgba(153,161,175,0.3)"
                  strokeDasharray="2 4"
                />
                {/* desks */}
                <rect x="60" y="60" width="70" height="26" rx="3" fill="var(--color-lighter)" stroke="rgba(153,161,175,0.25)" />
                <rect x="170" y="92" width="70" height="26" rx="3" fill="var(--color-lighter)" stroke="rgba(153,161,175,0.25)" />
                <rect x="95" y="132" width="80" height="26" rx="3" fill="var(--color-lighter)" stroke="rgba(153,161,175,0.25)" />
                <ellipse cx="235" cy="55" rx="36" ry="20" fill="var(--color-lighter)" stroke="rgba(153,161,175,0.25)" />
                {/* cameras */}
                <polygon points="160,13 138,58 182,58" fill="rgba(255,100,103,0.08)" />
                <circle cx="160" cy="13" r="4" fill="var(--color-error)" />
                <polygon points="327,120 285,105 285,150" fill="rgba(255,100,103,0.08)" />
                <circle cx="327" cy="120" r="4" fill="var(--color-error)" />
                {/* infiltration route */}
                <path
                  className={styles.route}
                  d="M22 156 C50 156 58 143 82 143 S120 118 150 112 C185 105 205 122 232 116 C258 111 262 84 280 66"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="22" cy="156" r="3.5" fill="var(--color-body)" />
                <text x="34" y="178" fontSize="9" letterSpacing="2" fill="var(--color-body)">
                  START
                </text>
                {/* vault */}
                <circle className={styles.pulse} cx="295" cy="45" r="13" fill="none" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="295" cy="45" r="13" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
                <circle cx="295" cy="45" r="4" fill="var(--color-primary)" />
                <text x="295" y="74" textAnchor="middle" fontSize="9" letterSpacing="2" fill="var(--color-body)">
                  VAULT
                </text>
              </svg>
            </div>

            <ol className="flex flex-col justify-center gap-6">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span className={styles.stepNum}>{step.num}</span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-snug">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
