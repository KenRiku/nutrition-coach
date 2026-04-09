"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Nav } from "@/components/nav"

interface Meal {
  id: string
  meal_type: string
  name: string
  description: string
  timing: string
  calories: number
  carbs_g: number
  protein_g: number
  fat_g: number
  ingredients: string[]
  supplements: { name: string; dose: string; timing: string }[]
}

interface NutritionPlan {
  id: string
  total_calories: number
  carbs_g: number
  protein_g: number
  fat_g: number
  hydration_ml: number
  ai_reasoning: string
  meals: Meal[]
}

interface Workout {
  id: string
  type: string
  date: string
  duration_minutes: number
  distance_km: number
  intensity: string
  notes: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  pre_workout: "Pre-Workout",
  lunch: "Lunch",
  post_workout: "Post-Workout",
  dinner: "Dinner",
  snack: "Snack",
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: "#64B5F6",
  pre_workout: "#FF5722",
  lunch: "#4CAF50",
  post_workout: "#FF9800",
  dinner: "#CE93D8",
  snack: "#80DEEA",
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackNote, setFeedbackNote] = useState("")
  const [feedbackSaved, setFeedbackSaved] = useState(false)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  // Week calendar state
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [planRes, workoutsRes] = await Promise.all([
        fetch("/api/plans/today"),
        fetch(`/api/workouts?weekStart=${weekStart.toISOString()}`),
      ])
      const planData = await planRes.json()
      const workoutsData = await workoutsRes.json()
      setPlan(planData || null)
      setWorkouts(Array.isArray(workoutsData) ? workoutsData : [])
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, fetchData, router])

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError("")
    try {
      const res = await fetch("/api/plans/generate", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setGenerateError(data.error || "Failed to generate plan")
      } else {
        setPlan(data)
        setFeedbackSaved(false)
        setFeedbackRating(0)
      }
    } catch {
      setGenerateError("Something went wrong. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  async function handleFeedback() {
    if (!plan || feedbackRating === 0) return
    try {
      const res = await fetch(`/api/plans/${plan.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ energy_rating: feedbackRating, notes: feedbackNote }),
      })
      if (res.ok) {
        setFeedbackSaved(true)
      }
    } catch (err) {
      console.error("Feedback error:", err)
    }
  }

  function getWorkoutsForDay(dayIndex: number): Workout[] {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + dayIndex)
    const dayStr = day.toDateString()
    return workouts.filter((w) => new Date(w.date).toDateString() === dayStr)
  }

  function getIntensityColor(intensity: string): string {
    const map: Record<string, string> = {
      easy: "var(--green)",
      moderate: "#FF9800",
      hard: "var(--orange)",
      race: "#FF1744",
    }
    return map[intensity] || "var(--text-muted)"
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)" }}>
        <Nav />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            color: "var(--text-muted)",
          }}
        >
          <div>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid var(--border)",
                borderTop: "2px solid var(--orange)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            Loading your dashboard...
          </div>
        </div>
      </div>
    )
  }

  const totalCals = plan?.total_calories || 0
  const carbPct = plan ? Math.round((plan.carbs_g * 4 / plan.total_calories) * 100) : 0
  const proteinPct = plan ? Math.round((plan.protein_g * 4 / plan.total_calories) * 100) : 0
  const fatPct = plan ? Math.round((plan.fat_g * 9 / plan.total_calories) * 100) : 0

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Nav />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
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
              Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              background: generating ? "var(--surface-3)" : "var(--orange)",
              color: "white",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "6px",
              cursor: generating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {generating ? (
              <>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Generating...
              </>
            ) : plan ? (
              "↻ Regenerate Plan"
            ) : (
              "⚡ Generate Today's Plan"
            )}
          </button>
        </div>

        {generateError && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "6px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
              color: "#FC8181",
            }}
          >
            {generateError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
          {/* Main column */}
          <div>
            {/* Macro Overview */}
            {plan && (
              <div
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
                    background: "linear-gradient(90deg, var(--orange), var(--green))",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Today&apos;s Targets
                  </h2>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: "2rem",
                      color: "var(--orange)",
                      lineHeight: 1,
                    }}
                  >
                    {totalCals.toLocaleString()}
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)", marginLeft: "4px" }}>
                      kcal
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                  {[
                    { label: "Carbs", value: plan.carbs_g, unit: "g", pct: carbPct, color: "#64B5F6" },
                    { label: "Protein", value: plan.protein_g, unit: "g", pct: proteinPct, color: "var(--green)" },
                    { label: "Fat", value: plan.fat_g, unit: "g", pct: fatPct, color: "#FF9800" },
                    { label: "Hydration", value: (plan.hydration_ml / 1000).toFixed(1), unit: "L", pct: null, color: "#64B5F6" },
                  ].map((macro) => (
                    <div key={macro.label}>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--text-muted)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {macro.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 800,
                          fontSize: "1.6rem",
                          color: macro.color,
                          lineHeight: 1,
                          marginBottom: "0.4rem",
                        }}
                      >
                        {macro.value}
                        <span style={{ fontSize: "0.8rem", marginLeft: "2px", opacity: 0.8 }}>{macro.unit}</span>
                      </div>
                      {macro.pct !== null && (
                        <div>
                          <div
                            style={{
                              height: "4px",
                              borderRadius: "2px",
                              background: "var(--surface-3)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${macro.pct}%`,
                                borderRadius: "2px",
                                background: macro.color,
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            {macro.pct}% of calories
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Reasoning */}
                <div
                  style={{
                    background: "rgba(255,87,34,0.06)",
                    border: "1px solid rgba(255,87,34,0.15)",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginTop: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--orange)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    AI Reasoning
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {plan.ai_reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* No plan state */}
            {!plan && !loading && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px dashed var(--border-light)",
                  borderRadius: "10px",
                  padding: "3rem",
                  textAlign: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚡</div>
                <h2
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  No Plan Yet
                </h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", maxWidth: "360px", margin: "0 auto 1.5rem" }}>
                  Generate your personalized AI nutrition plan for today. It takes about 5 seconds.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    background: "var(--orange)",
                    color: "white",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "0.85rem 2rem",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {generating ? "Generating..." : "Generate Plan"}
                </button>
              </div>
            )}

            {/* Meals */}
            {plan && plan.meals.length > 0 && (
              <div>
                <h2
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Meal Plan
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {plan.meals.map((meal) => (
                    <div
                      key={meal.id}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                        style={{
                          width: "100%",
                          padding: "1rem 1.25rem",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: MEAL_TYPE_COLORS[meal.meal_type] || "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: MEAL_TYPE_COLORS[meal.meal_type] || "var(--text-muted)",
                                marginBottom: "0.1rem",
                              }}
                            >
                              {MEAL_TYPE_LABELS[meal.meal_type] || meal.meal_type}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                color: "var(--foreground)",
                              }}
                            >
                              {meal.name}
                            </div>
                            {meal.timing && (
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                                {meal.timing}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontWeight: 700,
                                fontSize: "1.2rem",
                                color: "var(--orange)",
                              }}
                            >
                              {meal.calories}
                            </div>
                            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>kcal</div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            <span>C:{meal.carbs_g}g</span>
                            <span>P:{meal.protein_g}g</span>
                            <span>F:{meal.fat_g}g</span>
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                            {expandedMeal === meal.id ? "▲" : "▼"}
                          </div>
                        </div>
                      </button>

                      {expandedMeal === meal.id && (
                        <div
                          style={{
                            borderTop: "1px solid var(--border)",
                            padding: "1rem 1.25rem",
                            background: "var(--surface-2)",
                          }}
                        >
                          {meal.description && (
                            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.6 }}>
                              {meal.description}
                            </p>
                          )}
                          {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                              <div
                                style={{
                                  fontFamily: "'Barlow Condensed', sans-serif",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "var(--text-muted)",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                Ingredients
                              </div>
                              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                                {meal.ingredients.map((ing, i) => (
                                  <li
                                    key={i}
                                    style={{
                                      background: "var(--surface-3)",
                                      borderRadius: "4px",
                                      padding: "0.2rem 0.5rem",
                                      fontSize: "0.8rem",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    {ing}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(meal.supplements) && meal.supplements.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontFamily: "'Barlow Condensed', sans-serif",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "var(--text-muted)",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                Supplements
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {meal.supplements.map((sup, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      background: "rgba(255,87,34,0.08)",
                                      border: "1px solid rgba(255,87,34,0.2)",
                                      borderRadius: "6px",
                                      padding: "0.4rem 0.75rem",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    <span style={{ color: "var(--orange)", fontWeight: 500 }}>{sup.name}</span>
                                    <span style={{ color: "var(--text-muted)", marginLeft: "0.35rem" }}>
                                      {sup.dose} · {sup.timing}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {plan && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  How&apos;s Your Energy?
                </h3>
                {feedbackSaved ? (
                  <p style={{ color: "var(--green)", fontSize: "0.9rem" }}>✓ Feedback saved. Thanks!</p>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => setFeedbackRating(r)}
                          style={{
                            flex: 1,
                            padding: "0.5rem",
                            background: feedbackRating >= r ? "var(--orange)" : "var(--surface-2)",
                            border: `1px solid ${feedbackRating >= r ? "var(--orange)" : "var(--border)"}`,
                            borderRadius: "6px",
                            color: feedbackRating >= r ? "white" : "var(--text-muted)",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      placeholder="Optional note (e.g., felt sluggish, great energy...)"
                      style={{
                        width: "100%",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "0.65rem 1rem",
                        color: "var(--foreground)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.875rem",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <button
                      onClick={handleFeedback}
                      disabled={feedbackRating === 0}
                      style={{
                        background: feedbackRating === 0 ? "var(--surface-3)" : "var(--surface-2)",
                        border: `1px solid ${feedbackRating === 0 ? "var(--border)" : "var(--border-light)"}`,
                        color: feedbackRating === 0 ? "var(--text-muted)" : "var(--foreground)",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        cursor: feedbackRating === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      Save Feedback
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Weekly Calendar */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    textTransform: "uppercase",
                  }}
                >
                  This Week
                </h3>
                <a
                  href="/schedule"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--orange)",
                    textDecoration: "none",
                  }}
                >
                  + Add
                </a>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {DAYS.map((day, i) => {
                  const dayWorkouts = getWorkoutsForDay(i)
                  const dayDate = new Date(weekStart)
                  dayDate.setDate(weekStart.getDate() + i)
                  const isToday = dayDate.toDateString() === today.toDateString()
                  const isPast = dayDate < today && !isToday

                  return (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.6rem",
                        borderRadius: "6px",
                        background: isToday ? "rgba(255,87,34,0.08)" : "transparent",
                        border: isToday ? "1px solid rgba(255,87,34,0.2)" : "1px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: isToday ? "var(--orange)" : "var(--text-muted)",
                          }}
                        >
                          {day}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: isToday ? "var(--orange)" : isPast ? "var(--text-muted)" : "var(--foreground)",
                          }}
                        >
                          {dayDate.getDate()}
                        </div>
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        {dayWorkouts.length === 0 ? (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rest</span>
                        ) : (
                          dayWorkouts.map((w) => (
                            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <div
                                style={{
                                  width: "5px",
                                  height: "5px",
                                  borderRadius: "50%",
                                  background: getIntensityColor(w.intensity),
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-secondary)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {w.type}
                                {w.duration_minutes ? ` · ${w.duration_minutes}m` : ""}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick stats */}
            {plan && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "1.25rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Meal Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {plan.meals.map((meal) => (
                    <div key={meal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: MEAL_TYPE_COLORS[meal.meal_type] || "var(--text-muted)",
                          }}
                        />
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {MEAL_TYPE_LABELS[meal.meal_type] || meal.meal_type}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "var(--orange)",
                        }}
                      >
                        {meal.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
