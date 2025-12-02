import { NextResponse } from "next/server"
import { getAllPhones, addPhone, deletePhone, updatePhone, formatMac, normalizeMac } from "@/lib/phones-store"

export async function GET() {
  const phones = getAllPhones()
  // Don't expose passwords in the list
  const sanitized = phones.map(({ sipPassword, ...rest }) => rest)
  return NextResponse.json(sanitized)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { mac, model, label, sipServer, sipUser, sipPassword, displayName } = body

    if (!mac || !model || !sipServer || !sipUser || !sipPassword || !displayName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate MAC address format (should be 12 hex characters)
    const normalizedMac = normalizeMac(mac)
    if (normalizedMac.length !== 12 || !/^[a-f0-9]+$/.test(normalizedMac)) {
      return NextResponse.json({ error: "Invalid MAC address format" }, { status: 400 })
    }

    // Validate model
    if (!["331", "601"].includes(model)) {
      return NextResponse.json({ error: "Invalid phone model" }, { status: 400 })
    }

    const phone = addPhone({
      mac: formatMac(mac),
      model,
      label: label || "",
      sipServer,
      sipUser,
      sipPassword,
      displayName,
    })

    return NextResponse.json(phone, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { mac, ...updates } = body

    if (!mac) {
      return NextResponse.json({ error: "MAC address required" }, { status: 400 })
    }

    // Validate model if provided
    if (updates.model && !["331", "601"].includes(updates.model)) {
      return NextResponse.json({ error: "Invalid phone model" }, { status: 400 })
    }

    const phone = updatePhone(mac, updates)

    if (!phone) {
      return NextResponse.json({ error: "Phone not found" }, { status: 404 })
    }

    // Don't expose password in response
    const { sipPassword, ...sanitized } = phone
    return NextResponse.json(sanitized)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const mac = searchParams.get("mac")

  if (!mac) {
    return NextResponse.json({ error: "MAC address required" }, { status: 400 })
  }

  const deleted = deletePhone(mac)

  if (!deleted) {
    return NextResponse.json({ error: "Phone not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
