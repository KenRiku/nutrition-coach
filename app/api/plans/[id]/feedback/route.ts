import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { energy_rating, notes } = await req.json()

    if (typeof energy_rating !== "number" || energy_rating < 1 || energy_rating > 5) {
      return NextResponse.json({ error: "Energy rating must be 1-5" }, { status: 400 })
    }

    // Verify plan belongs to user
    const plan = await prisma.nutritionPlan.findFirst({
      where: { id: params.id, user_id: session.user.id },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const feedback = await prisma.planFeedback.create({
      data: {
        nutrition_plan_id: params.id,
        user_id: session.user.id,
        energy_rating,
        notes: notes || null,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (err) {
    console.error("Feedback POST error:", err)
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
  }
}
