import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders the first letter of a simple name", () => {
    render(<Avatar name="John" />)

    expect(screen.getByText("J")).toBeInTheDocument()
  })

  it("renders the first two uppercase letters for a PascalCase name", () => {
    render(<Avatar name="PascalCase" />)

    expect(screen.getByText("PC")).toBeInTheDocument()
  })

  it("has an accessible label with the full name", () => {
    render(<Avatar name="Jane Doe" />)

    expect(screen.getByRole("img", { name: "Jane Doe" })).toBeInTheDocument()
  })
})
