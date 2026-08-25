"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock8 } from "lucide-react"
import { useUser } from "@/components/UserProvider"

type AccessMode = "authenticated" | "guest"

interface RouteGuardProps {
  require: AccessMode
  children: React.ReactNode
}

export default function RouteGuard({ require, children }: RouteGuardProps) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  const allowed = isLoading
    ? false
    : require === "authenticated"
      ? Boolean(user)
      : !user

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace(require === "authenticated" ? "/login" : "/heists")
    }
  }, [isLoading, allowed, require, router])

  if (!allowed) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-svh flex-col items-center justify-center gap-3"
      >
        <Clock8 className="animate-spin text-primary" size={36} aria-hidden />
        <span className="text-sm text-body">Loading…</span>
      </div>
    )
  }

  return <>{children}</>
}
