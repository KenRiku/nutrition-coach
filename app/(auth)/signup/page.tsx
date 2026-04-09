"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "Name is required"
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required"
    if (password.length < 8) errs.password = "Password must be at least 8 characters"
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError("")
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error || "Failed to create account")
        return
      }

      // Sign in immediately after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setServerError("Account created but sign-in failed. Please log in.")
        router.push("/login")
      } else {
        router.push("/onboarding")
        router.refresh()
      }
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link
            href="/"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "2rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--foreground)",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--orange)" }}>E</span>ATHLETES
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Build your athlete profile
          </p>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "var(--orange)",
            }}
          />

          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.8rem",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            Create Account
          </h1>

          {serverError && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "6px",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: "#FC8181",
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                htmlFor="name"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                style={{
                  width: "100%",
                  background: "var(--surface-2)",
                  border: `1px solid ${errors.name ? "#FC8181" : "var(--border)"}`,
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  color: "var(--foreground)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.95rem",
                }}
              />
              {errors.name && (
                <p style={{ fontSize: "0.8rem", color: "#FC8181", marginTop: "0.25rem" }}>{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  background: "var(--surface-2)",
                  border: `1px solid ${errors.email ? "#FC8181" : "var(--border)"}`,
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  color: "var(--foreground)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.95rem",
                }}
              />
              {errors.email && (
                <p style={{ fontSize: "0.8rem", color: "#FC8181", marginTop: "0.25rem" }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                style={{
                  width: "100%",
                  background: "var(--surface-2)",
                  border: `1px solid ${errors.password ? "#FC8181" : "var(--border)"}`,
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  color: "var(--foreground)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.95rem",
                }}
              />
              {errors.password && (
                <p style={{ fontSize: "0.8rem", color: "#FC8181", marginTop: "0.25rem" }}>{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "var(--surface-3)" : "var(--orange)",
                color: "white",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.85rem",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "0.25rem",
              }}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--orange)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
