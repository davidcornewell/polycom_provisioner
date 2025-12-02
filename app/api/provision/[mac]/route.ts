import { NextResponse } from "next/server"
import { autoRegisterPhone, normalizeMac } from "@/lib/phones-store"
import { generateMasterConfig } from "@/lib/polycom-templates"

// This handles requests to /api/provision/[mac] (without filename)
// Polycom phones often request the master config at the root
export async function GET(request: Request, { params }: { params: Promise<{ mac: string }> }) {
  console.log("[v0] Provision route hit")

  try {
    const { mac } = await params
    console.log("[v0] MAC received:", mac)

    const normalizedMac = normalizeMac(mac)
    console.log("[v0] Normalized MAC:", normalizedMac)

    const phone = autoRegisterPhone(normalizedMac)
    console.log("[v0] Phone registered:", phone)

    const baseUrl = new URL(request.url).origin
    console.log("[v0] Base URL:", baseUrl)

    const content = generateMasterConfig(phone, baseUrl)
    console.log("[v0] Generated content:", content)

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.log("[v0] Error in provision route:", error)
    return new NextResponse(`<?xml version="1.0"?><error>${String(error)}</error>`, {
      headers: { "Content-Type": "application/xml" },
      status: 500,
    })
  }
}
