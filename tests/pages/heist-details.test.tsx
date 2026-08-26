import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Heist } from "@/types/firestore"

// page imports
import HeistDetailsPage from "@/app/(dashboard)/heists/[id]/page"

const mocks = vi.hoisted(() => ({
  result: {
    heist: null as Heist | null,
    isLoading: true,
    error: null as string | null,
    notFound: false,
  },
}))

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "h-1" }),
}))

vi.mock("@/hooks/useHeist", () => ({
  default: () => mocks.result,
}))

function makeHeist(): Heist {
  return {
    id: "h-1",
    createdAt: new Date("2026-08-22T12:00:00Z"),
    title: "Vault Break",
    description: "In and out.",
    createdBy: "uid-2",
    createdByCodename: "SilentCrimsonFox",
    assignedTo: "uid-1",
    assignedToCodename: "MidnightOwl",
    deadline: new Date("2026-08-25T12:00:00Z"),
    finalStatus: null,
  }
}

beforeEach(() => {
  mocks.result = {
    heist: null,
    isLoading: true,
    error: null,
    notFound: false,
  }
})

describe("Heist details page", () => {
  it("shows a back link to /heists while loading", () => {
    render(<HeistDetailsPage />)

    const backLink = screen.getByRole("link", { name: "Back to heists" })
    expect(backLink).toHaveAttribute("href", "/heists")
  })

  it("renders the dossier once the heist is loaded", () => {
    mocks.result = { heist: makeHeist(), isLoading: false, error: null, notFound: false }
    render(<HeistDetailsPage />)

    expect(
      screen.getByRole("heading", { name: "Vault Break" })
    ).toBeInTheDocument()
  })

  it("explains when the heist could not be found", () => {
    mocks.result = { heist: null, isLoading: false, error: null, notFound: true }
    render(<HeistDetailsPage />)

    expect(screen.getByText("This heist could not be found.")).toBeInTheDocument()
  })

  it("surfaces load errors via an alert", () => {
    mocks.result = {
      heist: null,
      isLoading: false,
      error: "Couldn't load this heist right now.",
      notFound: false,
    }
    render(<HeistDetailsPage />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load this heist right now."
    )
  })
})
