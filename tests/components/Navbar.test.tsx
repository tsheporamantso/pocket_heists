import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"

// component imports
import Navbar from "@/components/Navbar"
import { signOut } from "firebase/auth"

const mocks = vi.hoisted(() => ({
  authState: {
    user: null as Record<string, unknown> | null,
    isLoading: false,
  },
}))

vi.mock("@/lib/firebase", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }))
vi.mock("@/components/UserProvider", () => ({
  useUser: () => mocks.authState,
}))

const fakeUser = { uid: "uid-123", displayName: "SilentCrimsonFox" }

function setUserState(user: Record<string, unknown> | null, isLoading = false) {
  mocks.authState.user = user
  mocks.authState.isLoading = isLoading
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    setUserState(null)
    vi.mocked(signOut).mockResolvedValue(undefined)
  })

  it("renders the main heading", () => {
    render(<Navbar />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it("renders the Create Heist link", () => {
    render(<Navbar />)

    const createLink = screen.getByRole("link", { name: /create heist/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute("href", "/heists/create")
  })

  it("does not render a logout button when no user is logged in", () => {
    render(<Navbar />)

    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument()
  })

  it("does not render a logout button while auth state is loading", () => {
    setUserState(fakeUser, true)
    render(<Navbar />)

    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument()
  })

  it("renders a logout button when a user is logged in", () => {
    setUserState(fakeUser)
    render(<Navbar />)

    expect(
      screen.getByRole("button", { name: /log out/i })
    ).toBeInTheDocument()
  })

  it("signs the user out when the logout button is clicked", async () => {
    setUserState(fakeUser)
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole("button", { name: /log out/i }))

    expect(signOut).toHaveBeenCalledWith({})
  })

  it("disables the button while signing out and hides it once signed out", async () => {
    let resolveSignOut!: () => void
    vi.mocked(signOut).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignOut = resolve
        })
    )
    setUserState(fakeUser)
    const user = userEvent.setup()
    const { rerender } = render(<Navbar />)
    const button = screen.getByRole("button", { name: /log out/i })

    await user.click(button)
    expect(button).toBeDisabled()

    resolveSignOut()
    await waitFor(() => expect(button).toBeEnabled())

    setUserState(null)
    rerender(<Navbar />)
    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument()
  })

  it("shows an inline error and stays logged in when sign-out fails", async () => {
    vi.mocked(signOut).mockRejectedValue(new Error("network down"))
    setUserState(fakeUser)
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole("button", { name: /log out/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn't log you out/i
    )
    expect(screen.getByRole("button", { name: /log out/i })).toBeEnabled()
  })
})
