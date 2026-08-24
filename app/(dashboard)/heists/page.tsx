"use client"

import Skeleton from "@/components/Skeleton"
import useHeists, { type HeistsMode } from "@/hooks/useHeists"
import type { Heist } from "@/types/firestore"

const SECTIONS: Array<{ mode: HeistsMode; heading: string; className: string }> = [
  {
    mode: "active",
    heading: "Your Active Heists",
    className: "active-heists my-4",
  },
  {
    mode: "assigned",
    heading: "Heists You've Assigned",
    className: "assigned-heists my-4",
  },
  {
    mode: "expired",
    heading: "All Expired Heists",
    className: "expired-heists my-4",
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

function HeistSection({
  mode,
  heading,
  className,
}: {
  mode: HeistsMode
  heading: string
  className: string
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
        <div className="my-4 max-w-3xl">
          <Skeleton />
        </div>
      ) : heists.length === 0 ? (
        <p className="my-4 text-sm text-body">Nothing here yet.</p>
      ) : (
        <HeistTitles heists={heists} />
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
