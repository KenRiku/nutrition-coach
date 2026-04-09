import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get("weekStart")

  try {
    const where: any = { user_id: session.user.id }

    if (weekStart) {
      const start = new Date(weekStart)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      where.date = { gte: start, lt: end }
    }

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { date: "asc" },
    })

    return NextResponse.json(workouts)
  } catch (err) {
    console.error("Workouts GET error:", err)
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { type, date, duration_minutes, distance_km, intensity, calories_burned, notes } = await req.json()

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const workout = await prisma.workout.create({
      data: {
        user_id: session.user.id,
        source: "manual",
        type: type || "other",
        date: new Date(date),
        duration_minutes: duration_minutes ? parseInt(duration_minutes) : null,
        distance_km: distance_km ? parseFloat(distance_km) : null,
        intensity,
        calories_burned: calories_burned ? parseInt(calories_burned) : null,
        notes,
      },
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (err) {
    console.error("Workouts POST error:", err)
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 })
  }
}
