"use client"

import HeistCard from "@/components/HeistCard"
import HeistCardSkeleton from "@/components/HeistCardSkeleton"
import useHeists, { type HeistsMode } from "@/hooks/useHeists"
import type { Heist } from "@/types/firestore"

const SECTIONS: Array<{ mode: HeistsMode; heading: string; className: string; emptyMessage: string }> = [
  {
    mode: "active",
    heading: "Your Active Heists",
    className: "active-heists my-4",
    emptyMessage: "No active heists yet.",
  },
  {
    mode: "assigned",
    heading: "Heists You've Assigned",
    className: "assigned-heists my-4",
    emptyMessage: "No heists assigned yet.",
  },
  {
    mode: "expired",
    heading: "All Expired Heists",
    className: "expired-heists my-4",
    emptyMessage: "Nothing here yet.",
  },
]

function HeistCardGrid({
  heists,
  isLoading,
  variant = "active",
}: {
  heists: Heist[]
  isLoading: boolean
  variant?: "active" | "expired"
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <HeistCardSkeleton />
        <HeistCardSkeleton />
        <HeistCardSkeleton />
      </div>
    )
  }

  return (
    <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      {heists.map((heist) => (
        <li key={heist.id}>
          <HeistCard heist={heist} variant={variant} />
        </li>
      ))}
    </ul>
  )
}

function HeistSection({
  mode,
  heading,
  className,
  emptyMessage,
}: {
  mode: HeistsMode
  heading: string
  className: string
  emptyMessage: string
}) {
  const { heists, isLoading, error } = useHeists(mode)

  return (
    <div className={className}>
      <h2>{heading}</h2>
      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-error">
          {error}
        </p>
      )}
      {isLoading ? (
        <HeistCardGrid heists={[]} isLoading={true} />
      ) : heists.length === 0 ? (
        <p className="my-4 text-sm text-body">{emptyMessage}</p>
      ) : (
        <HeistCardGrid
          heists={heists}
          isLoading={false}
          variant={mode === "expired" ? "expired" : "active"}
        />
      )}
    </div>
  )
}

export default function HeistsPage() {
  return (
    <div className="page-content">
      {SECTIONS.map((section) => (
        <HeistSection key={section.mode} {...section} />
      ))}
    </div>
  )
}
