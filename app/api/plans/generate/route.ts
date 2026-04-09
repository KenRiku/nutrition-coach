import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get today's workouts
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayWorkouts = await prisma.workout.findMany({
      where: {
        user_id: session.user.id,
        date: { gte: today, lt: tomorrow },
      },
    })

    // Get this week's workouts for context
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekWorkouts = await prisma.workout.findMany({
      where: {
        user_id: session.user.id,
        date: { gte: weekStart, lt: tomorrow },
      },
    })

    const totalWeeklyDuration = weekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
    const totalWeeklyDistance = weekWorkouts.reduce((sum, w) => sum + (w.distance_km || 0), 0)

    const isRestDay = todayWorkouts.length === 0

    const dietaryPrefs = Array.isArray(user.dietary_preferences)
      ? (user.dietary_preferences as string[]).join(", ")
      : "No restrictions"

    const workoutContext = isRestDay
      ? "Rest day — no scheduled workouts today"
      : todayWorkouts
          .map(
            (w) =>
              `${w.type} - ${w.duration_minutes ? `${w.duration_minutes} minutes` : ""} ${w.distance_km ? `${w.distance_km}km` : ""} at ${w.intensity || "moderate"} intensity${w.notes ? `. Notes: ${w.notes}` : ""}`
          )
          .join("; ")

    const prompt = `You are an expert sports nutritionist. Create a personalized daily nutrition plan for this athlete.

ATHLETE PROFILE:
- Name: ${user.name}
- Age: ${user.age || "Not specified"}
- Sex: ${user.sex || "Not specified"}
- Weight: ${user.weight_kg ? `${user.weight_kg}kg` : "Not specified"}
- Height: ${user.height_cm ? `${user.height_cm}cm` : "Not specified"}
- Sport: ${user.sport_type || "General fitness"}
- Goal: ${user.goal || "General performance"}
- Dietary restrictions/preferences: ${dietaryPrefs}

TODAY'S TRAINING:
${workoutContext}

WEEKLY TRAINING CONTEXT:
- Total workouts this week: ${weekWorkouts.length}
- Total weekly training time: ${totalWeeklyDuration} minutes
- Total weekly distance: ${totalWeeklyDistance.toFixed(1)}km
- Today is a ${isRestDay ? "rest/recovery" : "training"} day

INSTRUCTIONS:
- Calculate exact macro targets based on body weight, training load, and goals
- ${isRestDay ? "This is a rest day — reduce carbs by 20-30%, keep protein high for recovery" : "Account for energy expenditure from today's workout"}
- Provide 4-6 meals timed appropriately around training
- Include practical, real-food meal ideas (not supplements-heavy)
- Add sport-specific supplement recommendations where evidence-based
- Timing suggestions should be specific (e.g., "7:00 AM - 90 min before workout")

Return ONLY valid JSON in this exact format:
{
  "total_calories": <number>,
  "carbs_g": <number>,
  "protein_g": <number>,
  "fat_g": <number>,
  "hydration_ml": <number>,
  "ai_reasoning": "<2-3 sentence explanation of why these macros and this plan>",
  "meals": [
    {
      "meal_type": "<breakfast|pre_workout|lunch|post_workout|dinner|snack>",
      "name": "<meal name>",
      "description": "<1-2 sentence description>",
      "timing": "<specific time and context e.g. 7:00 AM — 2 hours before workout>",
      "calories": <number>,
      "carbs_g": <number>,
      "protein_g": <number>,
      "fat_g": <number>,
      "ingredients": ["<ingredient 1>", "<ingredient 2>", ...],
      "supplements": [{"name": "<supplement>", "dose": "<dose>", "timing": "<when to take>"}]
    }
  ]
}`

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI")
    }

    // Extract JSON from response
    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response")
    }

    const planData = JSON.parse(jsonMatch[0])

    // Delete existing today's plan if any
    const existingPlan = await prisma.nutritionPlan.findFirst({
      where: {
        user_id: session.user.id,
        date: { gte: today, lt: tomorrow },
      },
    })

    if (existingPlan) {
      await prisma.nutritionPlan.delete({ where: { id: existingPlan.id } })
    }

    // Save to database
    const plan = await prisma.nutritionPlan.create({
      data: {
        user_id: session.user.id,
        date: today,
        total_calories: Math.round(planData.total_calories),
        carbs_g: planData.carbs_g,
        protein_g: planData.protein_g,
        fat_g: planData.fat_g,
        hydration_ml: planData.hydration_ml,
        ai_reasoning: planData.ai_reasoning,
        meals: {
          create: planData.meals.map((meal: any) => ({
            meal_type: meal.meal_type,
            name: meal.name,
            description: meal.description || "",
            timing: meal.timing || "",
            calories: Math.round(meal.calories || 0),
            carbs_g: meal.carbs_g || 0,
            protein_g: meal.protein_g || 0,
            fat_g: meal.fat_g || 0,
            ingredients: meal.ingredients || [],
            supplements: meal.supplements || [],
          })),
        },
      },
      include: { meals: true },
    })

    return NextResponse.json(plan)
  } catch (err) {
    console.error("Plan generate error:", err)
    return NextResponse.json({ error: "Failed to generate nutrition plan" }, { status: 500 })
  }
}
