import Link from "next/link"
import { Nav } from "@/components/nav"

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Nav />

      {/* Hero */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "6rem 1.5rem 4rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,87,34,0.1)",
              border: "1px solid rgba(255,87,34,0.3)",
              borderRadius: "100px",
              padding: "0.3rem 0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--orange)",
                display: "block",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--orange)",
              }}
            >
              AI-Powered Nutrition
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
              lineHeight: "0.95",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            FUEL LIKE
            <br />
            AN{" "}
            <span style={{ color: "var(--orange)" }}>ATHLETE</span>
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              lineHeight: "1.7",
              maxWidth: "480px",
              marginBottom: "2.5rem",
            }}
          >
            Personalized nutrition plans that adapt to your training load. Built for runners, cyclists, triathletes, and anyone who trains with intention.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/signup"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "white",
                textDecoration: "none",
                padding: "0.85rem 2rem",
                background: "var(--orange)",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Start Free →
            </Link>
            <Link
              href="/login"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--foreground)",
                textDecoration: "none",
                padding: "0.85rem 2rem",
                border: "1px solid var(--border-light)",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Hero visual — stats card */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
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
                background: "linear-gradient(90deg, var(--orange), var(--green))",
              }}
            />

            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "1rem",
              }}
            >
              Today&apos;s Plan — Interval Day
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {[
                { label: "Calories", value: "2,840", unit: "kcal", color: "var(--orange)" },
                { label: "Protein", value: "165", unit: "g", color: "var(--green)" },
                { label: "Carbs", value: "380", unit: "g", color: "#64B5F6" },
                { label: "Hydration", value: "3.2", unit: "L", color: "#CE93D8" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: "8px",
                    padding: "1rem",
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
                      fontSize: "2rem",
                      color: stat.color,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                    <span style={{ fontSize: "0.9rem", marginLeft: "2px", opacity: 0.8 }}>{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "rgba(255,87,34,0.08)",
                border: "1px solid rgba(255,87,34,0.2)",
                borderRadius: "8px",
                padding: "1rem",
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
                  marginBottom: "0.4rem",
                }}
              >
                AI Insight
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                High carb day — you have 8×400m intervals at 5K pace. Front-load carbs at breakfast and pre-workout meal.
              </p>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-1.5rem",
              right: "-1.5rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--green)",
                marginBottom: "0.25rem",
              }}
            >
              Pre-Workout
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                marginBottom: "0.15rem",
              }}
            >
              Overnight Oats + Banana
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>480 kcal · 75g carbs · 7:00 AM</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "6rem auto 4rem",
          padding: "0 1.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              marginBottom: "0.75rem",
            }}
          >
            BUILT FOR <span style={{ color: "var(--orange)" }}>PERFORMANCE</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
            Not a calorie counter. A training partner that knows your body.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
        >
          {[
            {
              icon: "⚡",
              title: "Adaptive Plans",
              description:
                "Nutrition adjusts daily based on your training load. Hard interval day? More carbs. Recovery ride? Lighter fare.",
            },
            {
              icon: "🎯",
              title: "Sport-Specific",
              description:
                "Dialed in for your sport and goals — whether you&apos;re building a base, peaking for a race, or cutting weight.",
            },
            {
              icon: "🧬",
              title: "AI Reasoning",
              description:
                "Every plan comes with Claude&apos;s explanation of why those macros, why those meals, what to prioritize.",
            },
            {
              icon: "📅",
              title: "Weekly Planning",
              description:
                "Log your training schedule ahead of time. The AI sees your week and plans accordingly.",
            },
            {
              icon: "💊",
              title: "Supplement Stack",
              description:
                "Evidence-based supplement recommendations timed to your workouts — caffeine, creatine, electrolytes.",
            },
            {
              icon: "📊",
              title: "Track & Iterate",
              description:
                "Rate your energy each day. The AI learns what works for your body and refines future plans.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1.75rem",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  marginBottom: "0.5rem",
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: feature.description }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto 6rem",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "4rem",
            textAlign: "center",
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
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              marginBottom: "1rem",
            }}
          >
            READY TO TRAIN <span style={{ color: "var(--orange)" }}>SMARTER</span>?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              fontSize: "1.1rem",
            }}
          >
            Set up your athlete profile in 3 minutes. Get your first AI nutrition plan instantly.
          </p>
          <Link
            href="/signup"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "white",
              textDecoration: "none",
              padding: "1rem 2.5rem",
              background: "var(--orange)",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "2rem 1.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ color: "var(--orange)" }}>E</span>ATHLETES
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          AI-powered sports nutrition. Built for athletes.
        </p>
      </footer>
    </div>
  )
}
