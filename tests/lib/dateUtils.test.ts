import { describe, it, expect, vi, afterEach } from "vitest"

// lib imports
import {
  formatRelativeDeadline,
  formatAbsoluteDeadline,
  formatRelativeExpiry,
} from "@/lib/dateUtils"

describe("formatRelativeDeadline", () => {
  it("returns 'Expired' when the deadline has passed", () => {
    const past = new Date(Date.now() - 1000)
    expect(formatRelativeDeadline(past)).toBe("Expired")
  })

  it("returns days left when more than a day remains", () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeDeadline(future)).toMatch(/days left/)
  })

  it("returns one day left when about a day remains", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
    expect(formatRelativeDeadline(future)).toBe("1 day left")
  })

  it("returns hours left when under a day remains", () => {
    const future = new Date(Date.now() + 5 * 60 * 60 * 1000)
    expect(formatRelativeDeadline(future)).toMatch(/hours left/)
  })
})

describe("formatAbsoluteDeadline", () => {
  it("formats as 'Mon D, YYYY'", () => {
    const date = new Date("2026-01-03T00:00:00Z")
    expect(formatAbsoluteDeadline(date)).toBe("Jan 3, 2026")
  })
})

describe("formatRelativeExpiry", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'Expired' when the deadline is exactly now or in the future", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-25T12:00:00Z"))
    const nowMs = Date.now()
    expect(formatRelativeExpiry(new Date(nowMs))).toBe("Expired")
    expect(formatRelativeExpiry(new Date(nowMs + 60 * 1000))).toBe("Expired")
  })

  it("returns 'Expired N days ago' when more than a day has passed", () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeExpiry(past)).toBe("Expired 3 days ago")
  })

  it("returns singular day phrasing when about a day has passed", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000)
    expect(formatRelativeExpiry(past)).toBe("Expired 1 day ago")
  })

  it("returns 'Expired N hours ago' when under a day has passed", () => {
    const past = new Date(Date.now() - 5 * 60 * 60 * 1000)
    expect(formatRelativeExpiry(past)).toBe("Expired 5 hours ago")
  })

  it("returns singular hour phrasing when about an hour has passed", () => {
    const past = new Date(Date.now() - 1 * 60 * 60 * 1000)
    expect(formatRelativeExpiry(past)).toBe("Expired 1 hour ago")
  })
})