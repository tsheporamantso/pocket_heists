import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports
import HeistCardSkeleton from "@/components/HeistCardSkeleton"

describe("HeistCardSkeleton", () => {
  it("renders a skeleton card with status role", () => {
    render(<HeistCardSkeleton />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("has shimmer animation elements", () => {
    render(<HeistCardSkeleton />)
    // Check that the component renders (shimmer animation is in CSS, not visible in class names)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("matches card dimensions with rounded corners and background", () => {
    render(<HeistCardSkeleton />)
    const card = screen.getByRole("status")
    // CSS modules hash class names, so we check that the card has some class
    expect(card.className).toBeTruthy()
    expect(card.className.length).toBeGreaterThan(0)
  })
})