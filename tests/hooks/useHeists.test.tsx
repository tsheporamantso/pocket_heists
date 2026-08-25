import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { User } from "firebase/auth"

// hook imports
import useHeists from "@/hooks/useHeists"
import { where, onSnapshot } from "firebase/firestore"

const mocks = vi.hoisted(() => ({
  authState: {
    user: null as User | null,
    isLoading: false,
  },
  unsubscribe: vi.fn(),
  // holds whatever converter was attached via .withConverter()
  converter: { current: null as { fromFirestore: (snap: unknown) => unknown } | null },
}))

vi.mock("@/components/UserProvider", () => ({
  useUser: () => mocks.authState,
}))
vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }))
vi.mock("firebase/firestore", () => {
  const collectionRef = {
    withConverter: vi.fn((converter: never) => {
      mocks.converter.current = converter
      return collectionRef
    }),
  }
  return {
    collection: vi.fn(() => collectionRef),
    query: vi.fn((base: unknown) => base),
    where: vi.fn(),
    onSnapshot: vi.fn(),
  }
})

const NOW = new Date("2026-08-24T12:00:00Z")

function hours(delta: number) {
  return new Date(NOW.getTime() + delta * 60 * 60 * 1000)
}

// raw Firestore timestamp stand-in, pre-conversion
function stamp(date: Date) {
  return { toDate: () => date }
}

interface DocOverrides {
  id?: string
  title?: string
  createdBy?: string
  assignedTo?: string
  deadline?: Date
  finalStatus?: string | null
}

function makeDoc(overrides: DocOverrides = {}) {
  const {
    id = "h-1",
    title = "Vault Break",
    createdBy = "uid-2",
    assignedTo = "uid-1",
    deadline = hours(24),
    finalStatus = null,
  } = overrides
  return {
    id,
    // raw doc as stored in Firestore (converter runs inside the SDK)
    data: () => ({
      title,
      description: "In and out.",
      createdBy,
      createdByCodename: `creator-${createdBy}`,
      assignedTo,
      assignedToCodename: `assignee-${assignedTo}`,
      createdAt: stamp(hours(-24)),
      deadline: stamp(deadline),
      finalStatus,
    }),
  }
}

let nextHandler: ((snap: unknown) => void) | null = null
let errorHandler: ((err: unknown) => void) | null = null

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useHeists", () => {
  beforeEach(() => {
    mocks.unsubscribe.mockReset()
    vi.mocked(where).mockClear()
    vi.mocked(onSnapshot).mockClear()
    nextHandler = null
    errorHandler = null
    // simulate the SDK pipeline: snapshot docs are run through the attached
    // converter, and converted docs still expose .data() returning the result
    vi.mocked(onSnapshot).mockImplementation(
      ((_q: unknown, onNext: (snap: unknown) => void, onError: (err: unknown) => void) => {
        const convert = (rawSnap: { docs: Array<{ id: string }> }) => ({
          docs: rawSnap.docs.map((raw) => ({
            id: raw.id,
            data: () => mocks.converter.current?.fromFirestore(raw),
          })),
        })
        nextHandler = (rawSnap) => onNext(convert(rawSnap as never))
        errorHandler = onError
        return mocks.unsubscribe
      }) as never
    )
    mocks.authState.user = {
      uid: "uid-1",
      displayName: "SilentCrimsonFox",
    } as unknown as User
  })

  it("scopes the active query to heists assigned to the current user", () => {
    renderHook(() => useHeists("active"))

    expect(where).toHaveBeenCalledWith("assignedTo", "==", "uid-1")
    expect(where).not.toHaveBeenCalledWith(
      "deadline",
      expect.anything(),
      expect.anything()
    )
  })

  it("scopes the assigned query to heists created by the current user", () => {
    renderHook(() => useHeists("assigned"))

    expect(where).toHaveBeenCalledWith("createdBy", "==", "uid-1")
  })

  it("filters expired by resolved status only", () => {
    renderHook(() => useHeists("expired"))

    expect(where).toHaveBeenCalledWith("finalStatus", "!=", null)
  })

  it("maps snapshot docs through the converter into Heist objects", () => {
    const { result } = renderHook(() => useHeists("active"))

    act(() =>
      nextHandler?.({ docs: [makeDoc({ id: "h-9", title: "Laser Crawl" })] })
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.heists).toHaveLength(1)
    const heist = result.current.heists[0]
    expect(heist.id).toBe("h-9")
    expect(heist.title).toBe("Laser Crawl")
    expect(heist.createdAt).toBeInstanceOf(Date)
    expect(heist.deadline).toBeInstanceOf(Date)
  })

  it("keeps only future-deadline heists in active mode", () => {
    const { result } = renderHook(() => useHeists("active"))

    act(() =>
      nextHandler?.({
        docs: [
          makeDoc({ id: "h-live", deadline: hours(2) }),
          makeDoc({ id: "h-stale", deadline: hours(-1) }),
        ],
      })
    )

    expect(result.current.heists.map((h) => h.id)).toEqual(["h-live"])
  })

  it("keeps only resolved past-deadline heists in expired mode regardless of user", () => {
    const { result } = renderHook(() => useHeists("expired"))

    act(() =>
      nextHandler?.({
        docs: [
          makeDoc({
            id: "h-done-other-user",
            assignedTo: "uid-7",
            createdBy: "uid-8",
            deadline: hours(-3),
            finalStatus: "success",
          }),
          makeDoc({ id: "h-unresolved", deadline: hours(-2), finalStatus: null }),
          makeDoc({ id: "h-not-yet", deadline: hours(5), finalStatus: "failure" }),
        ],
      })
    )

    expect(result.current.heists.map((h) => h.id)).toEqual(["h-done-other-user"])
  })

  it("sorts active by nearest deadline first and expired by most recently passed first", () => {
    const active = renderHook(() => useHeists("active"))
    act(() =>
      nextHandler?.({
        docs: [
          makeDoc({ id: "h-later", deadline: hours(6) }),
          makeDoc({ id: "h-soon", deadline: hours(1) }),
        ],
      })
    )
    expect(active.result.current.heists.map((h) => h.id)).toEqual([
      "h-soon",
      "h-later",
    ])

    const expired = renderHook(() => useHeists("expired"))
    act(() =>
      nextHandler?.({
        docs: [
          makeDoc({ id: "h-old", deadline: hours(-9), finalStatus: "success" }),
          makeDoc({ id: "h-recent", deadline: hours(-1), finalStatus: "success" }),
        ],
      })
    )
    expect(expired.result.current.heists.map((h) => h.id)).toEqual([
      "h-recent",
      "h-old",
    ])
  })

  it("applies snapshot updates live without remounting", () => {
    const { result } = renderHook(() => useHeists("active"))

    act(() => nextHandler?.({ docs: [makeDoc({ id: "h-1" })] }))
    act(() =>
      nextHandler?.({
        docs: [makeDoc({ id: "h-1" }), makeDoc({ id: "h-2" })],
      })
    )

    expect(result.current.heists.map((h) => h.id)).toEqual(["h-1", "h-2"])
  })

  it("rolls a heist out of active when its deadline passes via the ticking clock", () => {
    const { result } = renderHook(() => useHeists("active"))

    act(() =>
      nextHandler?.({ docs: [makeDoc({ id: "h-edge", deadline: hours(0.5) })] })
    )
    expect(result.current.heists.map((h) => h.id)).toEqual(["h-edge"])

    act(() => vi.advanceTimersByTime(60 * 60 * 1000))
    expect(result.current.heists).toHaveLength(0)
  })

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useHeists("active"))

    expect(mocks.unsubscribe).not.toHaveBeenCalled()
    unmount()
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it("re-subscribes when the mode changes", () => {
    const { rerender } = renderHook(
      ({ mode }: { mode: "active" | "assigned" | "expired" }) => useHeists(mode),
      { initialProps: { mode: "active" as const } }
    )
    expect(mocks.unsubscribe).not.toHaveBeenCalled()

    rerender({ mode: "expired" })

    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1)
    expect(where).toHaveBeenLastCalledWith("finalStatus", "!=", null)
  })

  it("stays empty and idle without a signed-in user", () => {
    mocks.authState.user = null
    const { result } = renderHook(() => useHeists("active"))

    expect(onSnapshot).not.toHaveBeenCalled()
    expect(result.current.heists).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it("exposes an error state when the listener fails", () => {
    const { result } = renderHook(() => useHeists("active"))

    act(() => errorHandler?.(new Error("permission denied")))

    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })
})
