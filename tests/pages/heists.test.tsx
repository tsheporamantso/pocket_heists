import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"

// mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// mock firebase/firestore
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}))

// mock @/lib/firebase
vi.mock("@/lib/firebase", () => ({
  db: {},
}))

// mock UserProvider
vi.mock("@/components/UserProvider", () => ({
  useUser: () => ({
    user: { uid: "user-123", displayName: "Test User" },
    isLoading: false,
  }),
}))

// mock useHeists hook
const mockUseHeists = vi.fn()
vi.mock("@/hooks/useHeists", () => ({
  default: (mode: string) => mockUseHeists(mode),
}))

// mock HeistCard component
vi.mock("@/components/HeistCard", () => ({
  default: ({ heist }: { heist: any }) => (
    <div data-testid={`heist-card-${heist.id}`}>
      <a href={`/heists/${heist.id}`}>{heist.title}</a>
      <span>{heist.assignedToCodename}</span>
    </div>
  ),
}))

// mock HeistCardSkeleton component
vi.mock("@/components/HeistCardSkeleton", () => ({
  default: () => <div data-testid="heist-card-skeleton" />,
}))

// mock Skeleton component
vi.mock("@/components/Skeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}))

const mockActiveHeists = [
  {
    id: "active-1",
    title: "Active Operation 1",
    assignedToCodename: "Phantom",
    deadline: new Date("2026-01-03"),
    finalStatus: null,
  },
  {
    id: "active-2",
    title: "Active Operation 2",
    assignedToCodename: "Shadow",
    deadline: new Date("2026-01-04"),
    finalStatus: "success",
  },
]

const mockAssignedHeists = [
  {
    id: "assigned-1",
    title: "Assigned Operation 1",
    assignedToCodename: "Ghost",
    deadline: new Date("2026-01-05"),
    finalStatus: null,
  },
  {
    id: "assigned-2",
    title: "Assigned Operation 2",
    assignedToCodename: "Specter",
    deadline: new Date("2026-01-06"),
    finalStatus: "failure",
  },
]

describe("HeistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseHeists.mockImplementation((mode: string) => {
      if (mode === "active") {
        return { heists: mockActiveHeists, isLoading: false, error: null }
      }
      if (mode === "assigned") {
        return { heists: mockAssignedHeists, isLoading: false, error: null }
      }
      if (mode === "expired") {
        return { heists: [], isLoading: false, error: null }
      }
      return { heists: [], isLoading: false, error: null }
    })
  })

  it("renders three sections with headings", async () => {
    const HeistsPage = (await import("@/app/(dashboard)/heists/page")).default
    render(<HeistsPage />)

    expect(screen.getByText("Your Active Heists")).toBeInTheDocument()
    expect(screen.getByText("Heists You've Assigned")).toBeInTheDocument()
    expect(screen.getByText("All Expired Heists")).toBeInTheDocument()
  })

  it("renders heist cards in grid layout for active section", async () => {
    const HeistsPage = (await import("@/app/(dashboard)/heists/page")).default
    render(<HeistsPage />)

    await waitFor(() => {
      expect(screen.getByTestId("heist-card-active-1")).toBeInTheDocument()
      expect(screen.getByTestId("heist-card-active-2")).toBeInTheDocument()
    })
  })

  it("renders heist cards in grid layout for assigned section", async () => {
    const HeistsPage = (await import("@/app/(dashboard)/heists/page")).default
    render(<HeistsPage />)

    await waitFor(() => {
      expect(screen.getByTestId("heist-card-assigned-1")).toBeInTheDocument()
      expect(screen.getByTestId("heist-card-assigned-2")).toBeInTheDocument()
    })
  })

  it("renders skeleton loaders when loading", async () => {
    mockUseHeists.mockImplementation((mode: string) => {
      if (mode === "active" || mode === "assigned") {
        return { heists: [], isLoading: true, error: null }
      }
      return { heists: [], isLoading: false, error: null }
    })

    const HeistsPage = (await import("@/app/(dashboard)/heists/page")).default
    render(<HeistsPage />)

    await waitFor(() => {
      const skeletons = screen.getAllByTestId("heist-card-skeleton")
      expect(skeletons.length).toBe(6) // 3 for active + 3 for assigned
    })
  })

  it("shows empty message when no heists", async () => {
    mockUseHeists.mockImplementation((mode: string) => {
      return { heists: [], isLoading: false, error: null }
    })

    const HeistsPage = (await import("@/app/(dashboard)/heists/page")).default
    render(<HeistsPage />)

    await waitFor(() => {
      expect(screen.getByText("No active heists yet.")).toBeInTheDocument()
      expect(screen.getByText("No heists assigned yet.")).toBeInTheDocument()
      expect(screen.getByText("Nothing here yet.")).toBeInTheDocument()
    })
  })

  it("renders expired section as plain list", async () => {
    const expiredHeists = [
      {
        id: "expired-1",
        title: "Expired Operation",
        assignedToCodename: "Ghost",
        deadline: new Date("2025-01-01"),
        finalStatus: "failure",
      },
    ]

    mockUseHeists.mockImplementation((mode: string) => {
      if (mode === "expired") {
        return { heists: expiredHeists, isLoading: false, error: null }
      }
      if (mode === "active") {
        return { heists: mockActiveHeists, isLoading: false, error: null }
      }
      if (mode === "assigned") {
        return { heists: mockAssignedHeists, isLoading: false, error: null }
      }
      return { heists: [], isLoading: false, error: null }
    })

    const HeistsPage = (await import("@/app/(dashboard)/heists/page")).default
    render(<HeistsPage />)

    await waitFor(() => {
      // Expired section should show plain list, not cards
      expect(screen.getByText("Expired Operation")).toBeInTheDocument()
      expect(screen.queryByTestId("heist-card-expired-1")).not.toBeInTheDocument()
    })
  })
})