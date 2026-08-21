import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"
import type { User, UserCredential } from "firebase/auth"

// component imports
import AuthForm from "@/components/AuthForm"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

const { push: pushMock } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }))
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}))
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}))

const fakeUser = { uid: "uid-123", email: "jane@example.com" } as unknown as User
const credential = { user: fakeUser } as unknown as UserCredential

describe("AuthForm", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    pushMock.mockReset()
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(credential)
    vi.mocked(updateProfile).mockResolvedValue(undefined)
    vi.mocked(setDoc).mockResolvedValue(undefined)
  })

  it("renders login form with email, password, toggle, and Login button", () => {
    render(<AuthForm mode="login" />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup"
    )
  })

  it("renders signup form with email, password, toggle, and Sign up button", () => {
    render(<AuthForm mode="signup" />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/login"
    )
  })

  it("logs entered details to the console on submit", async () => {
    const user = userEvent.setup()
    render(<AuthForm mode="login" />)

    await user.type(screen.getByLabelText(/email/i), "jane@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /login/i }))

    expect(console.log).toHaveBeenCalledWith({
      mode: "login",
      email: "jane@example.com",
      password: "secret123",
    })
  })

  it("toggles the password visibility when the toggle is clicked", async () => {
    const user = userEvent.setup()
    render(<AuthForm mode="login" />)

    const password = screen.getByLabelText("Password")
    expect(password).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: /show password/i }))
    expect(password).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: /hide password/i }))
    expect(password).toHaveAttribute("type", "password")
  })

  it("creates the account, sets a codename profile, writes the users doc, and redirects on signup", async () => {
    const user = userEvent.setup()
    render(<AuthForm mode="signup" />)

    await user.type(screen.getByLabelText(/email/i), "jane@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /sign up/i }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/heists"))

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "jane@example.com",
      "secret123"
    )

    const profile = vi.mocked(updateProfile).mock.calls[0][1]
    const codename = String(profile.displayName)
    expect(codename).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/)
    expect(updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: codename })

    expect(doc).toHaveBeenCalledWith({}, "users", "uid-123")
    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(vi.mocked(setDoc).mock.calls[0][1]).toEqual({
      codename,
      id: "uid-123",
    })
  })

  it("shows a friendly error and does not navigate when the email is already in use", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: "auth/email-already-in-use",
    })
    const user = userEvent.setup()
    render(<AuthForm mode="signup" />)

    await user.type(screen.getByLabelText(/email/i), "taken@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /sign up/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /already registered/i
    )
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("explains when email/password sign-up is not enabled for the project", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: "auth/configuration-not-found",
    })
    const user = userEvent.setup()
    render(<AuthForm mode="signup" />)

    await user.type(screen.getByLabelText(/email/i), "jane@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /sign up/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /isn't enabled/i
    )
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("disables the submit button while signup is in flight", async () => {
    let resolveSignup!: (value: UserCredential) => void
    vi.mocked(createUserWithEmailAndPassword).mockImplementation(
      () =>
        new Promise<UserCredential>((resolve) => {
          resolveSignup = resolve
        })
    )
    const user = userEvent.setup()
    render(<AuthForm mode="signup" />)

    await user.type(screen.getByLabelText(/email/i), "jane@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    const button = screen.getByRole("button", { name: /sign up/i })
    await user.click(button)

    expect(button).toBeDisabled()

    resolveSignup(credential)
    await waitFor(() => expect(button).toBeEnabled())
    expect(pushMock).toHaveBeenCalledWith("/heists")
  })
})
