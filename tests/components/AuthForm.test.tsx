import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"

// component imports
import AuthForm from "@/components/AuthForm"

describe("AuthForm", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {})
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
})