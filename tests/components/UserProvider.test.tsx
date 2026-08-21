import { StrictMode } from "react"
import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// component imports
import UserProvider, { useUser } from "@/components/UserProvider"

const { onAuthStateChangedMock, unsubscribe } = vi.hoisted(() => ({
  onAuthStateChangedMock: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: { appId: "test-app" },
}))

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: onAuthStateChangedMock,
}))

type FakeUser = { uid: string }

function emit(user: FakeUser | null) {
  const callback = onAuthStateChangedMock.mock.calls.at(-1)?.[1] as (
    u: FakeUser | null,
  ) => void
  act(() => {
    callback(user)
  })
}

function Probe({ label }: { label?: string }) {
  const { user, isLoading } = useUser()
  return (
    <div data-testid={label ? `probe-${label}` : "probe"}>
      {isLoading ? "loading" : user ? user.uid : "signed-out"}
    </div>
  )
}

describe("UserProvider / useUser", () => {
  beforeEach(() => {
    onAuthStateChangedMock.mockReset()
    unsubscribe.mockReset()
    onAuthStateChangedMock.mockReturnValue(unsubscribe)
  })

  it("returns an unresolved loading state before auth resolves", () => {
    render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    )

    expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("probe")).toHaveTextContent("loading")
  })

  it("reports signed out when auth resolves to null", () => {
    render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    )

    emit(null)

    expect(screen.getByTestId("probe")).toHaveTextContent("signed-out")
  })

  it("returns the user object when signed in", () => {
    render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    )

    emit({ uid: "user-1" })

    expect(screen.getByTestId("probe")).toHaveTextContent("user-1")
  })

  it("registers the listener only on mount and unsubscribes on unmount", () => {
    expect(onAuthStateChangedMock).not.toHaveBeenCalled()

    const { unmount } = render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    )

    expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1)

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it("updates every consumer from a single listener", () => {
    render(
      <UserProvider>
        <Probe />
        <Probe label="a" />
        <Probe label="b" />
      </UserProvider>,
    )

    expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1)

    emit({ uid: "user-2" })

    expect(screen.getByTestId("probe")).toHaveTextContent("user-2")
    expect(screen.getByTestId("probe-a")).toHaveTextContent("user-2")
    expect(screen.getByTestId("probe-b")).toHaveTextContent("user-2")
  })

  it("keeps exactly one active listener through StrictMode double-invoked effects", () => {
    render(
      <StrictMode>
        <UserProvider>
          <Probe />
        </UserProvider>
      </StrictMode>,
    )

    const setups = onAuthStateChangedMock.mock.calls.length
    const cleanups = unsubscribe.mock.calls.length
    expect(setups - cleanups).toBe(1)

    emit({ uid: "user-3" })

    expect(screen.getByTestId("probe")).toHaveTextContent("user-3")
  })

  it("gives late subscribers the current state immediately", () => {
    const { rerender } = render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    )

    emit({ uid: "user-4" })

    rerender(
      <UserProvider>
        <Probe />
        <Probe label="late" />
      </UserProvider>,
    )

    expect(screen.getByTestId("probe")).toHaveTextContent("user-4")
    expect(screen.getByTestId("probe-late")).toHaveTextContent("user-4")
  })

  it("lands on the final state after rapid successive changes", () => {
    render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    )

    act(() => {
      const callback = onAuthStateChangedMock.mock.calls[0][1] as (
        u: FakeUser | null,
      ) => void
      callback({ uid: "a" })
      callback({ uid: "b" })
      callback(null)
    })

    expect(screen.getByTestId("probe")).toHaveTextContent("signed-out")
  })

  it("throws a descriptive error outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(
      /useUser must be used within a UserProvider/i,
    )
  })
})
