"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Nav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/schedule", label: "Schedule" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <nav
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
        }}
      >
        {/* Logo */}
        <Link
          href={session ? "/dashboard" : "/"}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--foreground)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <span style={{ color: "var(--orange)" }}>E</span>ATHLETES
        </Link>

        {/* Desktop Nav */}
        {session && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: pathname === link.href ? "var(--orange)" : "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "4px",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "0.35rem 0.75rem",
                cursor: "pointer",
                marginLeft: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {!session && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link
              href="/login"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "0.4rem 0.75rem",
              }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "white",
                textDecoration: "none",
                padding: "0.4rem 1rem",
                background: "var(--orange)",
                borderRadius: "4px",
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
