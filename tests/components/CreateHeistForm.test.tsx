import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"
import type { User } from "firebase/auth"

// component imports
import CreateHeistForm from "@/components/CreateHeistForm"
import { getDocs, addDoc, serverTimestamp } from "firebase/firestore"

const mocks = vi.hoisted(() => ({
  authState: {
    user: null as User | null,
    isLoading: false,
  },
  push: vi.fn(),
}))

vi.mock("@/components/UserProvider", () => ({
  useUser: () => mocks.authState,
}))
vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}))
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({
    withConverter: vi.fn(() => ({})),
  })),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
}))

function setUsers(docs: Array<{ id: string; codename: string }>) {
  vi.mocked(getDocs).mockResolvedValue({
    docs: docs.map((d) => ({
      id: d.id,
      data: () => ({ id: d.id, codename: d.codename }),
    })),
  } as never)
}

const fakeUser = {
  uid: "uid-1",
  displayName: "SilentCrimsonFox",
} as unknown as User

const otherUsers = [
  { id: "uid-2", codename: "NeonVioletHawk" },
  { id: "uid-3", codename: "EmberGoldWolf" },
]

async function fillAndSubmit({
  title = "Vault Break",
  description = "In and out in 48 hours.",
  assigneeId,
}: {
  title?: string
  description?: string
  assigneeId?: string
}) {
  const user = userEvent.setup()
  render(<CreateHeistForm />)

  // wait for the users fetch to settle before interacting
  await screen.findByRole("option", { name: "NeonVioletHawk" })

  if (title !== "") {
    await user.type(screen.getByLabelText("Title"), title)
  }
  if (description !== "") {
    await user.type(screen.getByLabelText("Description"), description)
  }
  if (assigneeId) {
    await user.selectOptions(
      screen.getByLabelText("Assign Heist To"),
      assigneeId
    )
  }
  await user.click(screen.getByRole("button", { name: /create heist/i }))
  return user
}

describe("CreateHeistForm", () => {
  beforeEach(() => {
    mocks.authState.user = fakeUser
    mocks.push.mockReset()
    vi.mocked(addDoc).mockReset()
    vi.mocked(addDoc).mockResolvedValue({} as never)
    setUsers([{ id: "uid-1", codename: "SilentCrimsonFox" }, ...otherUsers])
  })

  it("renders title, description, assignee select, and submit button", async () => {
    render(<CreateHeistForm />)

    expect(screen.getByLabelText("Title")).toBeInTheDocument()
    expect(screen.getByLabelText("Description")).toBeInTheDocument()
    expect(await screen.findByLabelText("Assign Heist To")).toBeEnabled()
    expect(
      screen.getByRole("button", { name: /create heist/i })
    ).toBeInTheDocument()
  })

  it("loads users into the select excluding the current user", async () => {
    render(<CreateHeistForm />)

    const select = await screen.findByLabelText("Assign Heist To")
    const options = Array.from(select.querySelectorAll("option"))
    const labels = options.map((option) => option.textContent)

    expect(labels).toContain("NeonVioletHawk")
    expect(labels).toContain("EmberGoldWolf")
    expect(labels).not.toContain("SilentCrimsonFox")
  })

  it("blocks an empty submission with inline errors and never calls firestore", async () => {
    await fillAndSubmit({ title: "", description: "" })

    const alerts = await screen.findAllByRole("alert")
    expect(alerts.length).toBeGreaterThanOrEqual(1)
    expect(addDoc).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("writes a CreateHeistInput document and redirects on success", async () => {
    const before = Date.now()
    await fillAndSubmit({ assigneeId: "uid-2" })
    const after = Date.now()

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/heists"))

    expect(serverTimestamp).toHaveBeenCalled()
    expect(addDoc).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(addDoc).mock.calls[0][1]

    expect(payload.title).toBe("Vault Break")
    expect(payload.description).toBe("In and out in 48 hours.")
    expect(payload.createdBy).toBe("uid-1")
    expect(payload.createdByCodename).toBe("SilentCrimsonFox")
    expect(payload.assignedTo).toBe("uid-2")
    expect(payload.assignedToCodename).toBe("NeonVioletHawk")
    expect(payload.finalStatus).toBeNull()

    expect(payload.createdAt).toBe("SERVER_TIMESTAMP")
    const deadline = payload.deadline as Date
    expect(deadline.getTime()).toBeGreaterThanOrEqual(before + 48 * 60 * 60 * 1000)
    expect(deadline.getTime()).toBeLessThanOrEqual(after + 48 * 60 * 60 * 1000)
  })

  it("shows an error and stays put when the write fails", async () => {
    vi.mocked(addDoc).mockRejectedValue(new Error("permission denied"))
    await fillAndSubmit({ assigneeId: "uid-3" })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /something went wrong/i
    )
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("disables the submit button while the write is in flight", async () => {
    let resolveWrite!: (value: unknown) => void
    vi.mocked(addDoc).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveWrite = resolve
        })
    )
    await fillAndSubmit({ assigneeId: "uid-2" })

    const button = screen.getByRole("button", { name: /creating/i })
    expect(button).toBeDisabled()

    resolveWrite({})
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/heists")
    )
  })
})
