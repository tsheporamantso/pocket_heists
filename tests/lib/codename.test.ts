import { describe, it, expect, vi, afterEach } from "vitest"
import { ADJECTIVES, COLOURS, ANIMALS, generateCodename } from "@/lib/codename"

function cap(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

describe("generateCodename", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("always returns exactly three PascalCase words joined without separators", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCodename()).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/)
    }
  })

  it("picks one word from each set in order (adjective, colour, animal)", () => {
    const random = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.19)
      .mockReturnValueOnce(0.29)

    expect(generateCodename()).toBe(
      cap(ADJECTIVES[0]) + cap(COLOURS[1]) + cap(ANIMALS[2])
    )
    expect(random).toHaveBeenCalledTimes(3)
  })

  it("can draw the last word of each set", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999)

    expect(generateCodename()).toBe(
      cap(ADJECTIVES[ADJECTIVES.length - 1]) +
        cap(COLOURS[COLOURS.length - 1]) +
        cap(ANIMALS[ANIMALS.length - 1])
    )
  })

  it("uses internally unique word sets", () => {
    for (const set of [ADJECTIVES, COLOURS, ANIMALS]) {
      expect(new Set(set).size).toBe(set.length)
    }
  })
})
