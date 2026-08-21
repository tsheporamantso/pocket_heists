"use client"

// components
import RouteGuard from "@/components/RouteGuard"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RouteGuard require="guest">
      <main className="public">{children}</main>
    </RouteGuard>
  )
}
