import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { User } from "firebase/auth"

// component imports
import RouteGuard from "@/components/RouteGuard"

const mocks = vi.hoisted(() => ({
  authState: {
    user: null as User | null,
    isLoading: false,
  },
  replace: vi.fn(),
}))

vi.mock("@/components/UserProvider", () => ({
  useUser: () => mocks.authState,
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

const fakeUser = {
  uid: "uid-123",
  displayName: "SilentCrimsonFox",
} as unknown as User

function setUserState(user: User | null, isLoading = false) {
  mocks.authState.user = user
  mocks.authState.isLoading = isLoading
}

describe("RouteGuard", () => {
  beforeEach(() => {
    setUserState(null)
    mocks.replace.mockReset()
  })

  it("renders the loader instead of children while auth state is loading", () => {
    setUserState(fakeUser, true)
    render(
      <RouteGuard require="authenticated">
        <div>protected content</div>
      </RouteGuard>
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.queryByText("protected content")).not.toBeInTheDocument()
  })

  it("redirects to /login and hides children when authentication is required but no user is present", async () => {
    render(
      <RouteGuard require="authenticated">
        <div>protected content</div>
      </RouteGuard>
    )

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/login")
    )
    expect(screen.queryByText("protected content")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders children when authentication is required and a user is present", () => {
    setUserState(fakeUser)
    render(
      <RouteGuard require="authenticated">
        <div>protected content</div>
      </RouteGuard>
    )

    expect(screen.getByText("protected content")).toBeInTheDocument()
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  it("redirects to /heists and hides children when guest access is required but a user is present", async () => {
    setUserState(fakeUser)
    render(
      <RouteGuard require="guest">
        <div>guest content</div>
      </RouteGuard>
    )

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/heists")
    )
    expect(screen.queryByText("guest content")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders children when guest access is required and no user is present", () => {
    render(
      <RouteGuard require="guest">
        <div>guest content</div>
      </RouteGuard>
    )

    expect(screen.getByText("guest content")).toBeInTheDocument()
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
