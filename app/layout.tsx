import type { Metadata } from "next"
import "@/app/globals.css"

// components
import UserProvider from "@/components/UserProvider"

export const metadata: Metadata = {
  title: "Pocket Heist",
  description: "Tiny missions. Big office mischief.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}