import { NextResponse } from "next/server"
import { getGlobalConfig, updateGlobalConfig } from "@/lib/phones-store"

export async function GET() {
  return NextResponse.json(getGlobalConfig())
}

export async function PUT(request: Request) {
  const data = await request.json()
  const updated = updateGlobalConfig(data)
  return NextResponse.json(updated)
}
