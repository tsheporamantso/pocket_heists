import Footer from "@/components/Footer"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <main className="public flex-1">
        {children}
        <Footer />
      </main>
    </>
  )
}
