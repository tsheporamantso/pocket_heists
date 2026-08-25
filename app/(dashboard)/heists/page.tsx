"use client"

import Skeleton from "@/components/Skeleton"
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

function HeistTitles({ heists }: { heists: Heist[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {heists.map((heist) => (
        <li key={heist.id}>{heist.title}</li>
      ))}
    </ul>
  )
}

function HeistCardGrid({ heists, isLoading }: { heists: Heist[]; isLoading: boolean }) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      {heists.map((heist) => (
        <HeistCard key={heist.id} heist={heist} />
      ))}
    </div>
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
        mode === "expired" ? (
          <div className="my-4 max-w-3xl">
            <Skeleton />
          </div>
        ) : (
          <HeistCardGrid heists={[]} isLoading={true} />
        )
      ) : heists.length === 0 ? (
        <p className="my-4 text-sm text-body">{emptyMessage}</p>
      ) : mode === "expired" ? (
        <HeistTitles heists={heists} />
      ) : (
        <HeistCardGrid heists={heists} isLoading={false} />
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
