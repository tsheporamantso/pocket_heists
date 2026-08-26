import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// component imports
import HeistDetailCard from "@/components/HeistDetailCard"
import type { Heist } from "@/types/firestore"

const NOW = new Date("2026-08-24T12:00:00Z")

function hours(delta: number) {
  return new Date(NOW.getTime() + delta * 60 * 60 * 1000)
}

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h-1",
    createdAt: hours(-48),
    title: "Vault Break",
    description: "In and out before anyone notices it's gone.",
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
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe("HeistDetailCard", () => {
  it("renders title, description, assignee codename, and operative id", () => {
    render(<HeistDetailCard heist={makeHeist()} />)

    expect(
      screen.getByRole("heading", { name: "Vault Break" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("In and out before anyone notices it's gone.")
    ).toBeInTheDocument()
    expect(screen.getByText("MidnightOwl")).toBeInTheDocument()
    expect(screen.getByText("uid-1")).toBeInTheDocument()
  })

  it("shows the deadline in relative and absolute form while upcoming", () => {
    render(<HeistDetailCard heist={makeHeist({ deadline: hours(24) })} />)

    expect(screen.getByText("1 day left")).toBeInTheDocument()
    expect(screen.getByText("Aug 25, 2026")).toBeInTheDocument()
  })

  it("phrases the deadline as expired once the date has passed", () => {
    render(<HeistDetailCard heist={makeHeist({ deadline: hours(-24) })} />)

    expect(screen.getByText("Expired 1 day ago")).toBeInTheDocument()
  })

  it("shows In Progress for an unresolved heist with a future deadline", () => {
    render(<HeistDetailCard heist={makeHeist({ finalStatus: null })} />)

    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("shows Failed for an unresolved heist whose deadline has passed", () => {
    render(
      <HeistDetailCard
        heist={makeHeist({ finalStatus: null, deadline: hours(-2) })}
      />
    )

    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(screen.queryByText("In Progress")).not.toBeInTheDocument()
  })

  it("shows Failed when the final status is failure", () => {
    render(<HeistDetailCard heist={makeHeist({ finalStatus: "failure" })} />)

    expect(screen.getByText("Failed")).toBeInTheDocument()
  })

  it("keeps Completed for a successful heist even after its deadline passed", () => {
    render(
      <HeistDetailCard
        heist={makeHeist({ finalStatus: "success", deadline: hours(-48) })}
      />
    )

    expect(screen.getByText("Completed")).toBeInTheDocument()
    expect(screen.queryByText("Failed")).not.toBeInTheDocument()
  })
})
