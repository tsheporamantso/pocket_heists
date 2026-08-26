"use client";

import { useState } from "react";
import { Clock8, LogOut, PenLine } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { useUser } from "@/components/UserProvider";
import { auth } from "@/lib/firebase";
import styles from "./Navbar.module.css";

const LOGOUT_ERROR = "Couldn't log you out. Please try again.";

export default function Navbar() {
  const { user, isLoading } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    if (isSigningOut) return;
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
      setError(LOGOUT_ERROR);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul className="flex gap-x-2">
          {user && !isLoading && (
            <li>
              {error && (
                <p role="alert" aria-live="polite" className={styles.error}>
                  {error}
                </p>
              )}
              <button
                type="button"
                className="btn"
                onClick={handleLogout}
                disabled={isSigningOut}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LogOut size={16} aria-hidden />
                  {isSigningOut ? "Logging out…" : "Log out"}
                </span>
              </button>
            </li>
          )}
          <li>
            <Link href="/heists/create" className="btn">
              <span className="inline-flex items-center gap-1.5">
                <PenLine size={16} aria-hidden />
                Create Heist
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
