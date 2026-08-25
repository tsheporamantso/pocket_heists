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

  it("shows a copyright notice containing the current year", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2027-06-15T12:00:00Z"))
    render(<Footer />)
    expect(screen.getByText("© 2027 Pocket Heist")).toBeInTheDocument()
  })

  it("displays the Pocket Heist wordmark", () => {
    render(<Footer />)
    expect(screen.getByLabelText("Pocket Heist")).toBeInTheDocument()
  })
})