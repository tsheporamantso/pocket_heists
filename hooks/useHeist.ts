"use client"

import { useEffect, useMemo, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/components/UserProvider"
import {
  COLLECTIONS,
  heistConverter,
  type Heist,
} from "@/types/firestore"

const TICK_MS = 60 * 1000

export interface UseHeistResult {
  heist: Heist | null
  isLoading: boolean
  error: string | null
  notFound: boolean
  isExpired: boolean
}

export default function useHeist(id: string | undefined): UseHeistResult {
  const { user } = useUser()

  const [heist, setHeist] = useState<Heist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [now, setNow] = useState(() => new Date())

  // keep expiry-derived status fresh while the viewer sits on the page
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), TICK_MS)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (!user || !id) {
      setHeist(null)
      setIsLoading(false)
      setError(null)
      setNotFound(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setNotFound(false)

    const ref = doc(db, COLLECTIONS.HEISTS, id).withConverter(heistConverter)

    return onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setHeist(null)
          setNotFound(true)
        } else {
          setHeist(snapshot.data() as Heist)
          setNotFound(false)
        }
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Failed to listen to heist:", err)
        setError("Couldn't load this heist right now.")
        setIsLoading(false)
      }
    )
  }, [id, user])

  return useMemo(() => {
    const isExpired =
      heist !== null && heist.deadline.getTime() <= now.getTime()

    return { heist, isLoading, error, notFound, isExpired }
  }, [heist, isLoading, error, notFound, now])
}
