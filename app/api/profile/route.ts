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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        height_cm: true,
        weight_kg: true,
        age: true,
        sex: true,
        sport_type: true,
        goal: true,
        dietary_preferences: true,
        onboarding_completed: true,
        created_at: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error("Profile GET error:", err)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, height_cm, weight_kg, age, sex, sport_type, goal, dietary_preferences } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        height_cm: height_cm ? parseFloat(height_cm) : null,
        weight_kg: weight_kg ? parseFloat(weight_kg) : null,
        age: age ? parseInt(age) : null,
        sex: sex || null,
        sport_type: sport_type || null,
        goal: goal || null,
        dietary_preferences: dietary_preferences || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        height_cm: true,
        weight_kg: true,
        age: true,
        sex: true,
        sport_type: true,
        goal: true,
        dietary_preferences: true,
      },
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error("Profile PUT error:", err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
