"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/components/UserProvider"
import {
  COLLECTIONS,
  userConverter,
  type CreateHeistInput,
  type UserProfile,
} from "@/types/firestore"
import styles from "./CreateHeistForm.module.css"

const DEADLINE_MS = 48 * 60 * 60 * 1000
const GENERIC_ERROR = "Something went wrong. Please try again."

interface FieldErrors {
  title?: string
  description?: string
  assignee?: string
}

export default function CreateHeistForm() {
  const { user } = useUser()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")

  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState(false)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasCodename = Boolean(user?.displayName)

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      try {
        const snapshot = await getDocs(
          collection(db, COLLECTIONS.USERS).withConverter(userConverter)
        )
        if (!cancelled)
          setUsers(
            snapshot.docs
              .map((doc) => doc.data() as UserProfile)
              .filter((candidate) => candidate.id !== user?.uid)
          )
      } catch (err) {
        console.error("Failed to load users:", err)
        if (!cancelled) setUsersError(true)
      } finally {
        if (!cancelled) setIsLoadingUsers(false)
      }
    }

    loadUsers()
    return () => {
      cancelled = true
    }
  }, [user?.uid])

  function validate(): FieldErrors {
    return {
      title: title.trim() ? undefined : "Title is required.",
      description: description.trim()
        ? undefined
        : "Description is required.",
      assignee: assigneeId ? undefined : "Pick a user to assign the heist to.",
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError(null)

    const selected = users.find((candidate) => candidate.id === assigneeId)
    if (!user?.uid || !user.displayName || !selected) return
    if (nextErrors.title || nextErrors.description || nextErrors.assignee) {
      return
    }

    const payload: CreateHeistInput = {
      createdAt: serverTimestamp(),
      deadline: new Date(Date.now() + DEADLINE_MS),
      title: title.trim(),
      description: description.trim(),
      createdBy: user.uid,
      createdByCodename: user.displayName,
      assignedTo: selected.id,
      assignedToCodename: selected.codename,
      finalStatus: null,
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTIONS.HEISTS), payload)
      router.push("/heists")
    } catch (err) {
      console.error("Failed to create heist:", err)
      setSubmitError(GENERIC_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give the heist a name"
          className={styles.input}
        />
        {errors.title && (
          <p role="alert" aria-live="polite" className={styles.error}>
            {errors.title}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What's the plan?"
          className={styles.input}
        />
        {errors.description && (
          <p role="alert" aria-live="polite" className={styles.error}>
            {errors.description}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="assignee" className={styles.label}>
          Assign Heist To
        </label>
        <select
          id="assignee"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          disabled={isLoadingUsers || usersError}
          className={styles.input}
        >
          <option key="placeholder" value="">
            {isLoadingUsers ? "Loading users…" : "Select a user…"}
          </option>
          {users.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.codename}
            </option>
          ))}
        </select>
        {usersError && (
          <p role="alert" aria-live="polite" className={styles.error}>
            Couldn&apos;t load users. Refresh and try again.
          </p>
        )}
        {!isLoadingUsers && !usersError && users.length === 0 && (
          <p className={styles.hint}>No other users to assign yet.</p>
        )}
        {errors.assignee && (
          <p role="alert" aria-live="polite" className={styles.error}>
            {errors.assignee}
          </p>
        )}
      </div>

      {!hasCodename && (
        <p role="status" aria-live="polite" className={styles.hint}>
          Your profile has no codename yet, so you can&apos;t create heists.
        </p>
      )}

      {submitError && (
        <p role="alert" aria-live="polite" className={styles.error}>
          {submitError}
        </p>
      )}

      <button type="submit" className="btn" disabled={isSubmitting || !hasCodename}>
        {isSubmitting ? "Creating…" : "Create Heist"}
      </button>
    </form>
  )
}
