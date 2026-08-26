"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import HeistDetailCard from "@/components/HeistDetailCard"
import Skeleton from "@/components/Skeleton"
import useHeist from "@/hooks/useHeist"

export default function HeistDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { heist, isLoading, error, notFound, isExpired } = useHeist(id)

  return (
    <div className="page-content">
      <Link
        href="/heists"
        className="mb-6 inline-flex items-center gap-2 self-start rounded-lg border border-lighter px-4 py-2 text-sm font-semibold transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to heists
      </Link>

      {error && (
        <p role="alert" aria-live="polite" className="my-4 text-sm text-error">
          {error}
        </p>
      )}

      {isLoading ? (
        <Skeleton />
      ) : notFound || !id ? (
        <p className="my-4 text-sm text-body">
          This heist could not be found.
        </p>
      ) : (
        heist && <HeistDetailCard heist={heist} isExpired={isExpired} />
      )}
    </div>
  )
}
