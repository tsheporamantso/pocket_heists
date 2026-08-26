import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { User } from "firebase/auth"

// hook imports
import useHeist from "@/hooks/useHeist"
import { doc, onSnapshot } from "firebase/firestore"

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
  const docRef = {
    withConverter: vi.fn((converter: never) => {
      mocks.converter.current = converter
      return docRef
    }),
  }
  return {
    doc: vi.fn(() => docRef),
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

function makeRawDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: "h-9",
    // raw doc as stored in Firestore (converter runs inside the SDK)
    data: () => ({
      title: "Laser Crawl",
      description: "Duct work only.",
      createdBy: "uid-2",
      createdByCodename: "creator-uid-2",
      assignedTo: "uid-1",
      assignedToCodename: "assignee-uid-1",
      createdAt: stamp(hours(-24)),
      deadline: stamp(hours(24)),
      finalStatus: null,
      ...overrides,
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

describe("useHeist", () => {
  beforeEach(() => {
    mocks.unsubscribe.mockReset()
    vi.mocked(doc).mockClear()
    vi.mocked(onSnapshot).mockClear()
    nextHandler = null
    errorHandler = null
    // simulate the SDK pipeline: the snapshot is run through the attached
    // converter, and the converted snapshot exposes exists()/data()
    vi.mocked(onSnapshot).mockImplementation(
      ((_ref: unknown, onNext: (snap: unknown) => void, onError: (err: unknown) => void) => {
        const convert = (rawSnap: { exists: boolean }) => ({
          exists: () => rawSnap.exists,
          data: () => mocks.converter.current?.fromFirestore(rawSnap),
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

  it("subscribes to the requested heist document", () => {
    renderHook(() => useHeist("h-9"))

    expect(doc).toHaveBeenCalledWith({}, "heists", "h-9")
    expect(onSnapshot).toHaveBeenCalledTimes(1)
  })

  it("maps the snapshot through the converter into a Heist object", () => {
    const { result } = renderHook(() => useHeist("h-9"))

    act(() => nextHandler?.({ exists: true, ...makeRawDoc() }))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.notFound).toBe(false)
    const heist = result.current.heist
    expect(heist?.id).toBe("h-9")
    expect(heist?.title).toBe("Laser Crawl")
    expect(heist?.createdAt).toBeInstanceOf(Date)
    expect(heist?.deadline).toBeInstanceOf(Date)
  })

  it("derives isExpired from the deadline against the ticking clock", () => {
    const { result } = renderHook(() => useHeist("h-9"))

    act(() =>
      nextHandler?.({ exists: true, ...makeRawDoc({ deadline: stamp(hours(0.5)) }) })
    )
    expect(result.current.isExpired).toBe(false)

    act(() => vi.advanceTimersByTime(60 * 60 * 1000))
    expect(result.current.isExpired).toBe(true)
  })

  it("reports isExpired false without a loaded heist", () => {
    const { result } = renderHook(() => useHeist("h-missing"))

    act(() => nextHandler?.({ exists: false }))

    expect(result.current.isExpired).toBe(false)
  })

  it("flags notFound when the document does not exist", () => {
    const { result } = renderHook(() => useHeist("h-missing"))

    act(() => nextHandler?.({ exists: false }))

    expect(result.current.heist).toBeNull()
    expect(result.current.notFound).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it("exposes an error state when the listener fails", () => {
    const { result } = renderHook(() => useHeist("h-9"))

    act(() => errorHandler?.(new Error("permission denied")))

    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })

  it("applies live updates without remounting", () => {
    const { result } = renderHook(() => useHeist("h-9"))

    act(() =>
      nextHandler?.({
        exists: true,
        ...makeRawDoc({ finalStatus: null }),
      })
    )
    act(() =>
      nextHandler?.({
        exists: true,
        ...makeRawDoc({ finalStatus: "success" }),
      })
    )

    expect(result.current.heist?.finalStatus).toBe("success")
  })

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useHeist("h-9"))

    expect(mocks.unsubscribe).not.toHaveBeenCalled()
    unmount()
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it("re-subscribes when the id changes", () => {
    const { rerender } = renderHook(
      ({ id }: { id: string | undefined }) => useHeist(id),
      { initialProps: { id: "h-1" as string | undefined } }
    )

    rerender({ id: "h-2" })

    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1)
    expect(doc).toHaveBeenLastCalledWith({}, "heists", "h-2")
  })

  it("stays idle without a signed-in user", () => {
    mocks.authState.user = null
    const { result } = renderHook(() => useHeist("h-9"))

    expect(onSnapshot).not.toHaveBeenCalled()
    expect(result.current.heist).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it("stays idle without an id", () => {
    const { result } = renderHook(() => useHeist(undefined))

    expect(doc).not.toHaveBeenCalled()
    expect(result.current.heist).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })
})
