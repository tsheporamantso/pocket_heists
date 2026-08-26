import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"

// component imports
import Footer from "@/components/Footer"

describe("Footer", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the contentinfo landmark", () => {
    render(<Footer />)
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })

  it("shows a copyright notice with the author, year, and all rights reserved", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2027-06-15T12:00:00Z"))
    render(<Footer />)
    expect(
      screen.getByText("© 2027 Tshepo Ramantso. All rights reserved.")
    ).toBeInTheDocument()
  })

  it("links the Pocket Heist wordmark back to the splash page", () => {
    render(<Footer />)
    const homeLink = screen.getByRole("link", { name: "Pocket Heist" })
    expect(homeLink).toHaveAttribute("href", "/")
  })

  it("links to GitHub, Facebook, and Instagram profiles", () => {
    render(<Footer />)
    const expected = {
      GitHub: "https://github.com/tsheporamantso",
      Facebook: "https://facebook.com",
      Instagram: "https://instagram.com",
    }
    for (const [name, href] of Object.entries(expected)) {
      const link = screen.getByRole("link", { name })
      expect(link).toHaveAttribute("href", href)
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noreferrer")
    }
  })

  it("does not turn the author name into a link", () => {
    render(<Footer />)
    expect(
      screen.queryByRole("link", { name: "Tshepo Ramantso" })
    ).toBeNull()
  })
})
