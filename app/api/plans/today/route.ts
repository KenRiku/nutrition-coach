import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const plan = await prisma.nutritionPlan.findFirst({
      where: {
        user_id: session.user.id,
        date: { gte: today, lt: tomorrow },
      },
      include: { meals: true },
      orderBy: { generated_at: "desc" },
    })

    return NextResponse.json(plan)
  } catch (err) {
    console.error("Plans today GET error:", err)
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 })
  }
}
