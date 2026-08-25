"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateCodename } from "@/lib/codename"
import styles from "./AuthForm.module.css"

type AuthMode = "login" | "signup"

interface AuthFormProps {
  mode: AuthMode
}

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":
    "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/network-request-failed":
    "Network trouble — check your connection and try again.",
  "auth/operation-not-allowed": "Email sign-up isn't enabled right now.",
  "auth/configuration-not-found":
    "Email and password sign-up isn't enabled for this project yet.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
}

const GENERIC_ERROR = "Something went wrong. Please try again."
const SETUP_FAILED_ERROR =
  "Your account was created, but setting up your profile failed. Please try logging in."

function getErrorCode(err: unknown) {
  if (typeof err === "object" && err !== null && "code" in err) {
    return String((err as { code: unknown }).code)
  }
  return ""
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const isLogin = mode === "login"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError(null)
    setSuccess(null)

    setIsSubmitting(true)
    try {
      if (isLogin) {
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )
        setSuccess(
          user.displayName
            ? `Welcome back, ${user.displayName}!`
            : "Welcome back!"
        )
      } else {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
        const codename = generateCodename()
        try {
          await updateProfile(user, { displayName: codename })
          await setDoc(doc(db, "users", user.uid), { codename, id: user.uid })
        } catch (err) {
          console.error("Profile setup failed:", err)
          setError(SETUP_FAILED_ERROR)
          return
        }
        router.push("/heists")
      }
    } catch (err) {
      console.error(isLogin ? "Login failed:" : "Signup failed:", err)
      setError(ERROR_MESSAGES[getErrorCode(err)] ?? GENERIC_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className={styles.input}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={styles.toggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className={styles.error}>
          {error}
        </p>
      )}

      {success && (
        <p role="status" aria-live="polite" className={styles.success}>
          {success}
        </p>
      )}

      <button type="submit" className="btn" disabled={isSubmitting}>
        {isSubmitting
          ? isLogin
            ? "Logging in…"
            : "Signing up…"
          : isLogin
            ? "Login"
            : "Sign up"}
      </button>

      <p className={styles.switch}>
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className={styles.link}>
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className={styles.link}>
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
