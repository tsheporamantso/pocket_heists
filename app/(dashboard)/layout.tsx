"use client"

// components
import Navbar from "@/components/Navbar"
import RouteGuard from "@/components/RouteGuard"
import Footer from "@/components/Footer"

export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RouteGuard require="authenticated">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </RouteGuard>
  )
}
