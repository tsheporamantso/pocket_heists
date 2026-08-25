"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/components/UserProvider"
import {
  COLLECTIONS,
  heistConverter,
  type Heist,
} from "@/types/firestore"

export type HeistsMode = "active" | "assigned" | "expired"

const TICK_MS = 60 * 1000

export interface UseHeistsResult {
  heists: Heist[]
  isLoading: boolean
  error: string | null
}

function byDeadlineAsc(a: Heist, b: Heist) {
  return a.deadline.getTime() - b.deadline.getTime()
}

function byDeadlineDesc(a: Heist, b: Heist) {
  return b.deadline.getTime() - a.deadline.getTime()
}

export default function useHeists(mode: HeistsMode): UseHeistsResult {
  const { user } = useUser()

  const [docs, setDocs] = useState<Heist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), TICK_MS)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (!user) {
      setDocs([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    const heists = collection(db, COLLECTIONS.HEISTS)
    const base =
      mode === "active"
        ? query(heists, where("assignedTo", "==", user.uid))
        : mode === "assigned"
          ? query(heists, where("createdBy", "==", user.uid))
          : query(heists, where("finalStatus", "!=", null))

    return onSnapshot(
      base.withConverter(heistConverter),
      (snapshot) => {
        setDocs(snapshot.docs.map((doc) => doc.data() as Heist))
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`Failed to listen to ${mode} heists:`, err)
        setError("Couldn't load heists right now.")
        setIsLoading(false)
      }
    )
  }, [mode, user])

  return useMemo(() => {
    let scoped = docs
    switch (mode) {
      case "active":
        scoped = docs.filter(
          (heist) =>
            user?.uid === heist.assignedTo && heist.deadline.getTime() > now.getTime()
        )
        break
      case "assigned":
        scoped = docs.filter(
          (heist) =>
            user?.uid === heist.createdBy && heist.deadline.getTime() > now.getTime()
        )
        break
      case "expired":
        scoped = docs.filter(
          (heist) =>
            heist.finalStatus !== null && heist.deadline.getTime() <= now.getTime()
        )
        break
    }

    const sorted = [...scoped].sort(mode === "expired" ? byDeadlineDesc : byDeadlineAsc)

    return { heists: sorted, isLoading, error }
  }, [docs, now, mode, isLoading, error, user])
}
