"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Body Metrics
  const [height_cm, setHeightCm] = useState("")
  const [weight_kg, setWeightKg] = useState("")
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")

  // Step 2: Sport & Goals
  const [sport_type, setSportType] = useState("")
  const [goal, setGoal] = useState("")

  // Step 3: Dietary Preferences
  const [dietary_preferences, setDietaryPreferences] = useState<string[]>([])

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  function togglePref(pref: string) {
    if (pref === "No restrictions") {
      setDietaryPreferences(["No restrictions"])
      return
    }
    setDietaryPreferences((prev) => {
      const without = prev.filter(p => p !== "No restrictions")
      if (without.includes(pref)) return without.filter(p => p !== pref)
      return [...without, pref]
    })
  }

  async function handleFinish() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height_cm, weight_kg, age, sex, sport_type, goal, dietary_preferences }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to save profile")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ["Body Metrics", "Sport & Goals", "Dietary Preferences"]

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
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--foreground)",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--orange)" }}>E</span>ATHLETES
          </Link>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                background: s <= step ? "var(--orange)" : "var(--surface-3)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--orange)",
            }}
          >
            Step {step} of 3
          </span>
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
              fontWeight: 800,
              fontSize: "2rem",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            {stepTitles[step - 1]}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
            {step === 1 && "We use this to calculate your precise caloric needs."}
            {step === 2 && "Tell us what you train for and what you're working toward."}
            {step === 3 && "Any restrictions or preferences we should know about?"}
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "6px",
                padding: "0.75rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: "#FC8181",
              }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Body Metrics */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
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
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Sport & Goals */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={labelStyle}>Primary Sport</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {SPORT_TYPES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSportType(s)}
                      style={{
                        padding: "0.4rem 0.85rem",
                        borderRadius: "100px",
                        border: `1px solid ${sport_type === s ? "var(--orange)" : "var(--border)"}`,
                        background: sport_type === s ? "rgba(255,87,34,0.12)" : "transparent",
                        color: sport_type === s ? "var(--orange)" : "var(--text-secondary)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
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
                        padding: "0.4rem 0.85rem",
                        borderRadius: "100px",
                        border: `1px solid ${goal === g ? "var(--orange)" : "var(--border)"}`,
                        background: goal === g ? "rgba(255,87,34,0.12)" : "transparent",
                        color: goal === g ? "var(--orange)" : "var(--text-secondary)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dietary Preferences */}
          {step === 3 && (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {DIETARY_PREFS.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePref(pref)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "100px",
                      border: `1px solid ${dietary_preferences.includes(pref) ? "var(--green)" : "var(--border)"}`,
                      background: dietary_preferences.includes(pref) ? "rgba(76,175,80,0.12)" : "transparent",
                      color: dietary_preferences.includes(pref) ? "var(--green)" : "var(--text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1,
                  padding: "0.85rem",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  borderRadius: "6px",
                  color: "var(--foreground)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  flex: 2,
                  padding: "0.85rem",
                  background: "var(--orange)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "0.85rem",
                  background: loading ? "var(--surface-3)" : "var(--orange)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Saving..." : "Go to Dashboard →"}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          You can update all of this later in your profile
        </p>
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
  padding: "0.75rem 1rem",
  color: "var(--foreground)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.95rem",
}
