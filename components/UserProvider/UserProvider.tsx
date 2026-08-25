"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

type UserState = {
  user: User | null
  isLoading: boolean
}

const UserContext = createContext<UserState | null>(null)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({ user: null, isLoading: true })

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setState({ user, isLoading: false })
    })
  }, [])

  return <UserContext.Provider value={state}>{children}</UserContext.Provider>
}

export function useUser(): UserState {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
