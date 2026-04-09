"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Nav } from "@/components/nav"

const SPORT_TYPES = [
  "Running", "Cycling", "Swimming", "Triathlon", "Strength Training",
  "CrossFit", "Team Sports", "Rowing", "Hiking", "General Fitness"
]

const GOALS = [
  "Build aerobic base", "Peak for a race", "Lose body fat", "Gain muscle",
  "Improve endurance", "Improve power", "Maintain fitness", "Recovery"
]

const DIETARY_PREFS = [
  "No restrictions", "Vegetarian", "Vegan", "Gluten-free",
  "Dairy-free", "Nut allergy", "Halal", "Kosher", "Low-carb", "Paleo"
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [height_cm, setHeightCm] = useState("")
  const [weight_kg, setWeightKg] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [sport_type, setSportType] = useState("")
  const [goal, setGoal] = useState("")
  const [dietary_preferences, setDietaryPreferences] = useState<string[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      // Load current profile data
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setName(data.name || "")
            setHeightCm(data.height_cm?.toString() || "")
            setWeightKg(data.weight_kg?.toString() || "")
            setAge(data.age?.toString() || "")
            setSex(data.sex || "")
            setSportType(data.sport_type || "")
            setGoal(data.goal || "")
            setDietaryPreferences(Array.isArray(data.dietary_preferences) ? data.dietary_preferences : [])
          }
        })
        .catch(() => {
          // If profile fetch fails, use session data
          if (session?.user?.name) setName(session.user.name)
        })
    }
  }, [status, session, router])

  function togglePref(pref: string) {
    if (pref === "No restrictions") {
      setDietaryPreferences(["No restrictions"])
      return
    }
    setDietaryPreferences((prev) => {
      const without = prev.filter((p) => p !== "No restrictions")
      if (without.includes(pref)) return without.filter((p) => p !== pref)
      return [...without, pref]
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError("")

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          height_cm: height_cm || null,
          weight_kg: weight_kg || null,
          age: age || null,
          sex: sex || null,
          sport_type: sport_type || null,
          goal: goal || null,
          dietary_preferences,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to save profile")
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)" }}>
        <Nav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Nav />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "2.5rem",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: "0.25rem",
            }}
          >
            Athlete Profile
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Your data shapes every nutrition plan. Keep it accurate.
          </p>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        {saved && (
          <div
            style={{
              background: "rgba(76,175,80,0.1)",
              border: "1px solid rgba(76,175,80,0.3)",
              borderRadius: "6px",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
              color: "var(--green)",
            }}
          >
            ✓ Profile saved successfully
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Account */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "1.5rem",
              marginBottom: "1.25rem",
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
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Account
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
                />
              </div>
            </div>
          </section>

          {/* Body Metrics */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "1.5rem",
              marginBottom: "1.25rem",
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
                background: "#64B5F6",
              }}
            />
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Body Metrics
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Height (cm)</label>
                <input
                  type="number"
                  value={height_cm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input
                  type="number"
                  value={weight_kg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  step="0.1"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  min="13"
                  max="100"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sport & Goals */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "1.5rem",
              marginBottom: "1.25rem",
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
                background: "var(--green)",
              }}
            />
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Sport & Goals
            </h2>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Primary Sport</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {SPORT_TYPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSportType(s)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "100px",
                      border: `1px solid ${sport_type === s ? "var(--orange)" : "var(--border)"}`,
                      background: sport_type === s ? "rgba(255,87,34,0.12)" : "transparent",
                      color: sport_type === s ? "var(--orange)" : "var(--text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.825rem",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Primary Goal</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "100px",
                      border: `1px solid ${goal === g ? "var(--orange)" : "var(--border)"}`,
                      background: goal === g ? "rgba(255,87,34,0.12)" : "transparent",
                      color: goal === g ? "var(--orange)" : "var(--text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.825rem",
                      cursor: "pointer",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Dietary Preferences */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
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
                background: "#CE93D8",
              }}
            />
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Dietary Preferences
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {DIETARY_PREFS.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => togglePref(pref)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "100px",
                    border: `1px solid ${dietary_preferences.includes(pref) ? "var(--green)" : "var(--border)"}`,
                    background: dietary_preferences.includes(pref) ? "rgba(76,175,80,0.12)" : "transparent",
                    color: dietary_preferences.includes(pref) ? "var(--green)" : "var(--text-secondary)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.825rem",
                    cursor: "pointer",
                  }}
                >
                  {pref}
                </button>
              ))}
            </div>
          </section>

          {/* Save */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? "var(--surface-3)" : "var(--orange)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.85rem 2rem",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text-muted)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "0.85rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 600,
  fontSize: "0.75rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: "0.4rem",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "0.65rem 0.85rem",
  color: "var(--foreground)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.9rem",
}
