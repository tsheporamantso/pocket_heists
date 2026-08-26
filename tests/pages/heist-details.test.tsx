import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Heist } from "@/types/firestore"

// page imports
import HeistDetailsPage from "@/app/(dashboard)/heists/[id]/page"

const NOW = new Date("2026-08-24T12:00:00Z")

const mocks = vi.hoisted(() => ({
  result: {
    heist: null as Heist | null,
    isLoading: true,
    error: null as string | null,
    notFound: false,
    now: new Date("2026-08-24T12:00:00Z"),
  },
}))

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "h-1" }),
}))

vi.mock("@/hooks/useHeist", () => ({
  default: () => mocks.result,
}))

function hours(delta: number) {
  return new Date(NOW.getTime() + delta * 60 * 60 * 1000)
}

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h-1",
    createdAt: hours(-48),
    title: "Vault Break",
    description: "In and out.",
    createdBy: "uid-2",
    createdByCodename: "SilentCrimsonFox",
    assignedTo: "uid-1",
    assignedToCodename: "MidnightOwl",
    deadline: hours(24),
    finalStatus: null,
    ...overrides,
  }
}

beforeEach(() => {
  mocks.result = {
    heist: null,
    isLoading: true,
    error: null,
    notFound: false,
    now: NOW,
  }
})

describe("Heist details page", () => {
  it("shows a back link to /heists while loading", () => {
    render(<HeistDetailsPage />)

    const backLink = screen.getByRole("link", { name: "Back to heists" })
    expect(backLink).toHaveAttribute("href", "/heists")
  })

  it("renders the dossier once the heist is loaded", () => {
    mocks.result = {
      heist: makeHeist(),
      isLoading: false,
      error: null,
      notFound: false,
      now: NOW,
    }
    render(<HeistDetailsPage />)

    expect(
      screen.getByRole("heading", { name: "Vault Break" })
    ).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("threads the hook clock into the dossier so expiry drives status", () => {
    mocks.result = {
      heist: makeHeist({ deadline: hours(-1) }),
      isLoading: false,
      error: null,
      notFound: false,
      now: NOW,
    }
    render(<HeistDetailsPage />)

    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(screen.getByText("Expired 1 hour ago")).toBeInTheDocument()
    expect(screen.queryByText("In Progress")).not.toBeInTheDocument()
  })

  it("explains when the heist could not be found", () => {
    mocks.result = {
      heist: null,
      isLoading: false,
      error: null,
      notFound: true,
      now: NOW,
    }
    render(<HeistDetailsPage />)

    expect(
      screen.getByText("This heist could not be found.")
    ).toBeInTheDocument()
  })

  it("surfaces load errors via an alert", () => {
    mocks.result = {
      heist: null,
      isLoading: false,
      error: "Couldn't load this heist right now.",
      notFound: false,
      now: NOW,
    }
    render(<HeistDetailsPage />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load this heist right now."
    )
  })
})
