import AuthForm from "@/components/AuthForm"

export default function LoginPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Log in to Your Account</h2>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}