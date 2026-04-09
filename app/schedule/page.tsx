"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Nav } from "@/components/nav"

interface Workout {
  id: string
  type: string
  date: string
  duration_minutes: number | null
  distance_km: number | null
  intensity: string | null
  calories_burned: number | null
  notes: string | null
}

const WORKOUT_TYPES = ["run", "ride", "swim", "strength", "rest", "other"]
const INTENSITIES = ["easy", "moderate", "hard", "race"]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getWeekDates(offset: number = 0): Date[] {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + offset * 7)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function getIntensityColor(intensity: string | null): string {
  const map: Record<string, string> = {
    easy: "var(--green)",
    moderate: "#FF9800",
    hard: "var(--orange)",
    race: "#FF1744",
  }
  return (intensity && map[intensity]) || "var(--text-muted)"
}

function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    run: "🏃",
    ride: "🚴",
    swim: "🏊",
    strength: "🏋️",
    rest: "😴",
    other: "⚡",
  }
  return map[type] || "⚡"
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formType, setFormType] = useState("run")
  const [formDuration, setFormDuration] = useState("")
  const [formDistance, setFormDistance] = useState("")
  const [formIntensity, setFormIntensity] = useState("moderate")
  const [formCalories, setFormCalories] = useState("")
  const [formNotes, setFormNotes] = useState("")

  const weekDates = getWeekDates(weekOffset)
  const weekStart = weekDates[0]

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/workouts?weekStart=${weekStart.toISOString()}`)
      const data = await res.json()
      setWorkouts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Fetch workouts error:", err)
    } finally {
      setLoading(false)
    }
  }, [weekStart.toISOString()])

  useEffect(() => {
    if (status === "authenticated") {
      fetchWorkouts()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, fetchWorkouts, router])

  async function handleAddWorkout(e: React.FormEvent) {
    e.preventDefault()
    if (!formDate) {
      setFormError("Date is required")
      return
    }

    setFormLoading(true)
    setFormError("")
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          date: formDate,
          duration_minutes: formDuration || null,
          distance_km: formDistance || null,
          intensity: formIntensity,
          calories_burned: formCalories || null,
          notes: formNotes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Failed to add workout")
      } else {
        await fetchWorkouts()
        setShowForm(false)
        setFormDate(new Date().toISOString().split("T")[0])
        setFormType("run")
        setFormDuration("")
        setFormDistance("")
        setFormIntensity("moderate")
        setFormCalories("")
        setFormNotes("")
      }
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" })
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setDeletingId(null)
    }
  }

  function getWorkoutsForDay(date: Date): Workout[] {
    return workouts.filter((w) => new Date(w.date).toDateString() === date.toDateString())
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
              Training Schedule
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Week of {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--foreground)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.5rem 0.85rem",
                cursor: "pointer",
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                background: weekOffset === 0 ? "rgba(255,87,34,0.12)" : "var(--surface)",
                border: `1px solid ${weekOffset === 0 ? "rgba(255,87,34,0.3)" : "var(--border)"}`,
                borderRadius: "6px",
                color: weekOffset === 0 ? "var(--orange)" : "var(--foreground)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.5rem 0.85rem",
                cursor: "pointer",
              }}
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--foreground)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.5rem 0.85rem",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "var(--orange)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "0.6rem 1.25rem",
                cursor: "pointer",
              }}
            >
              + Add Workout
            </button>
          </div>
        </div>

        {/* Add Workout Form */}
        {showForm && (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              padding: "1.5rem",
              marginBottom: "2rem",
              position: "relative",
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
                borderRadius: "10px 10px 0 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
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
                Add Workout
              </h2>
              <button
                onClick={() => { setShowForm(false); setFormError("") }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "6px",
                  padding: "0.65rem 1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.875rem",
                  color: "#FC8181",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleAddWorkout}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {WORKOUT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {getTypeEmoji(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Intensity</label>
                  <select
                    value={formIntensity}
                    onChange={(e) => setFormIntensity(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {INTENSITIES.map((i) => (
                      <option key={i} value={i}>
                        {i.charAt(0).toUpperCase() + i.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Duration (min)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="60"
                    min="1"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Distance (km)</label>
                  <input
                    type="number"
                    value={formDistance}
                    onChange={(e) => setFormDistance(e.target.value)}
                    placeholder="10.5"
                    step="0.1"
                    min="0"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Calories Burned</label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    placeholder="450"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g., 8×400m intervals at 5K pace"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    background: formLoading ? "var(--surface-3)" : "var(--orange)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.65rem 1.5rem",
                    cursor: formLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {formLoading ? "Adding..." : "Add Workout"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError("") }}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text-secondary)",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.65rem 1.25rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Weekly Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            Loading workouts...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.75rem" }}>
            {weekDates.map((date, i) => {
              const dayWorkouts = getWorkoutsForDay(date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isPast = date < new Date() && !isToday

              return (
                <div key={i}>
                  {/* Day header */}
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: isToday ? "var(--orange)" : "var(--text-muted)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {DAYS[i]}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 800,
                        fontSize: "1.2rem",
                        color: isToday ? "var(--orange)" : isPast ? "var(--text-muted)" : "var(--foreground)",
                      }}
                    >
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Day column */}
                  <div
                    style={{
                      background: isToday ? "rgba(255,87,34,0.04)" : "var(--surface)",
                      border: `1px solid ${isToday ? "rgba(255,87,34,0.2)" : "var(--border)"}`,
                      borderRadius: "8px",
                      padding: "0.75rem",
                      minHeight: "120px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    {dayWorkouts.length === 0 ? (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textAlign: "center",
                          marginTop: "1rem",
                          fontStyle: "italic",
                        }}
                      >
                        Rest
                      </div>
                    ) : (
                      dayWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          style={{
                            background: "var(--surface-2)",
                            borderRadius: "6px",
                            padding: "0.5rem",
                            borderLeft: `3px solid ${getIntensityColor(workout.intensity)}`,
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "var(--foreground)",
                              marginBottom: "0.15rem",
                            }}
                          >
                            {getTypeEmoji(workout.type)} {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                          </div>
                          {workout.duration_minutes && (
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              {workout.duration_minutes}m
                              {workout.distance_km ? ` · ${workout.distance_km}km` : ""}
                            </div>
                          )}
                          {workout.intensity && (
                            <div
                              style={{
                                fontSize: "0.65rem",
                                color: getIntensityColor(workout.intensity),
                                fontWeight: 500,
                                marginTop: "0.1rem",
                              }}
                            >
                              {workout.intensity}
                            </div>
                          )}
                          <button
                            onClick={() => handleDelete(workout.id)}
                            disabled={deletingId === workout.id}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.7rem",
                              padding: "2px 4px",
                              lineHeight: 1,
                              opacity: 0.6,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Weekly summary */}
        {workouts.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            {[
              {
                label: "Workouts",
                value: workouts.filter((w) => w.type !== "rest").length,
                unit: "sessions",
                color: "var(--orange)",
              },
              {
                label: "Total Time",
                value: Math.round(workouts.reduce((s, w) => s + (w.duration_minutes || 0), 0) / 60 * 10) / 10,
                unit: "hours",
                color: "var(--green)",
              },
              {
                label: "Distance",
                value: Math.round(workouts.reduce((s, w) => s + (w.distance_km || 0), 0) * 10) / 10,
                unit: "km",
                color: "#64B5F6",
              },
              {
                label: "Est. Calories",
                value: workouts.reduce((s, w) => s + (w.calories_burned || 0), 0).toLocaleString(),
                unit: "kcal",
                color: "#FF9800",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1rem 1.25rem",
                }}
              >
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
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.6rem",
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                  <span style={{ fontSize: "0.75rem", marginLeft: "3px", opacity: 0.8 }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
