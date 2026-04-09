import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { height_cm, weight_kg, age, sex, sport_type, goal, dietary_preferences } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        height_cm: height_cm ? parseFloat(height_cm) : null,
        weight_kg: weight_kg ? parseFloat(weight_kg) : null,
        age: age ? parseInt(age) : null,
        sex,
        sport_type,
        goal,
        dietary_preferences: dietary_preferences || [],
        onboarding_completed: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Onboarding error:", err)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
