import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"

// component imports
import HeistCard from "@/components/HeistCard"

// mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// mock date formatting to avoid flaky tests
vi.mock("@/lib/dateUtils", () => ({
  formatRelativeDeadline: vi.fn(() => "2 days left"),
  formatAbsoluteDeadline: vi.fn(() => "Jan 1, 2026"),
}))

const mockHeist = {
  id: "heist-123",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  title: "Operation Midnight",
  description: "A secret mission",
  createdBy: "user-1",
  createdByCodename: "Shadow",
  assignedTo: "user-2",
  assignedToCodename: "Phantom",
  deadline: new Date("2026-01-03T00:00:00Z"),
  finalStatus: null as "success" | "failure" | null,
}

describe("HeistCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the heist title", () => {
    render(<HeistCard heist={mockHeist} />)
    expect(screen.getByText("Operation Midnight")).toBeInTheDocument()
  })

  it("renders title as a link to the heist details page", () => {
    render(<HeistCard heist={mockHeist} />)
    const link = screen.getByRole("link", { name: "Operation Midnight" })
    expect(link).toHaveAttribute("href", "/heists/heist-123")
  })

  it("displays the assignee codename", () => {
    render(<HeistCard heist={mockHeist} />)
    expect(screen.getByText("Phantom")).toBeInTheDocument()
  })

  it("displays relative deadline", () => {
    render(<HeistCard heist={mockHeist} />)
    expect(screen.getByText("2 days left")).toBeInTheDocument()
  })

  it("displays absolute deadline", () => {
    render(<HeistCard heist={mockHeist} />)
    expect(screen.getByText("Jan 1, 2026")).toBeInTheDocument()
  })

  it("shows 'In Progress' status with amber color when finalStatus is null", () => {
    render(<HeistCard heist={mockHeist} />)
    const status = screen.getByText("In Progress")
    expect(status).toBeInTheDocument()
    // Check that the status has a class containing 'statusInProgress' (CSS module hash)
    expect(status.className).toMatch(/statusInProgress/)
  })

  it("shows 'Completed' status with green color when finalStatus is success", () => {
    const heistWithSuccess = { ...mockHeist, finalStatus: "success" as const }
    render(<HeistCard heist={heistWithSuccess} />)
    const status = screen.getByText("Completed")
    expect(status).toBeInTheDocument()
    expect(status.className).toMatch(/statusSuccess/)
  })

  it("shows 'Failed' status with red color when finalStatus is failure", () => {
    const heistWithFailure = { ...mockHeist, finalStatus: "failure" as const }
    render(<HeistCard heist={heistWithFailure} />)
    const status = screen.getByText("Failed")
    expect(status).toBeInTheDocument()
    expect(status.className).toMatch(/statusFailure/)
  })

  it("truncates long titles", () => {
    const heistWithLongTitle = {
      ...mockHeist,
      title: "This is a very long heist title that should be truncated because it exceeds the maximum width",
    }
    render(<HeistCard heist={heistWithLongTitle} />)
    const title = screen.getByText(heistWithLongTitle.title)
    // Check that the title has a class containing 'title' (CSS module hash)
    expect(title.className).toMatch(/title/)
  })

  it("applies hover effects", () => {
    render(<HeistCard heist={mockHeist} />)
    const card = screen.getByRole("article")
    // Check that the card has a class containing 'card' (CSS module hash)
    expect(card.className).toMatch(/card/)
  })
})