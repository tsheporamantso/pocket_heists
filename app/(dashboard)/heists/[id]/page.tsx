"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import HeistDetailCard from "@/components/HeistDetailCard"
import Skeleton from "@/components/Skeleton"
import useHeist from "@/hooks/useHeist"
import styles from "./page.module.css"

export default function HeistDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { heist, isLoading, error, notFound, now } = useHeist(id)

  return (
    <div className="page-content">
      <Link href="/heists" className={styles.backLink}>
        <ArrowLeft size={16} aria-hidden />
        Back to heists
      </Link>

      {error && (
        <p role="alert" className="my-4 text-sm text-error">
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
        heist && <HeistDetailCard heist={heist} now={now} />
      )}
    </div>
  )
}
