import { NextResponse } from "next/server"
import { autoRegisterPhone, normalizeMac, getGlobalConfig } from "@/lib/phones-store"
import {
  generateMasterConfig,
  generatePhoneConfig,
  generateSipConfig,
  generateBootromConfig,
  generateDirectoryConfig,
} from "@/lib/polycom-templates"

// This handles requests to /api/provision/[mac] (without filename)
// Polycom phones often request the master config at the root
export async function GET(request: Request, { params }: { params: Promise<{ mac: string }> }) {
  console.log("[v0] Provision route hit")

  try {
    const { mac } = await params
    console.log("[v0] MAC received:", mac)

    // Check if this looks like a MAC-filename combination (e.g., 0004f2ac2ba0-phone.cfg)
    const parts = mac.split(/(?=-)/)
    let filename: string | null = null
    let macOnly = mac

    if (parts.length > 1) {
      macOnly = parts[0]
      filename = mac.substring(macOnly.length + 1) // +1 to skip the dash
    } else {
      // Extract just the MAC address, removing any file extension
      macOnly = mac.split(/[.-]/)[0]
    }

    const normalizedMac = normalizeMac(macOnly)
    console.log("[v0] Normalized MAC:", normalizedMac)

    // If we have a filename, handle it specifically
    if (filename) {
      console.log("[v0] Filename detected:", filename)
      const globalConfig = getGlobalConfig()
      const lowerFilename = filename.toLowerCase()
      let content: string

      if (lowerFilename === `${normalizedMac}-phone.cfg` || lowerFilename === "phone.cfg") {
        content = generatePhoneConfig(autoRegisterPhone(normalizedMac))
        console.log("[v0] Serving phone config")
      } else if (lowerFilename === `${normalizedMac}-sip.cfg` || lowerFilename === "sip.cfg") {
        content = generateSipConfig(autoRegisterPhone(normalizedMac), globalConfig)
        console.log("[v0] Serving sip config")
      } else if (lowerFilename === `${normalizedMac}-directory.xml` || lowerFilename === "directory.xml") {
        content = generateDirectoryConfig(globalConfig.contacts)
        console.log("[v0] Serving directory config")
      } else if (lowerFilename === "bootrom.cfg") {
        content = generateBootromConfig()
        console.log("[v0] Serving bootrom config")
      } else {
        console.log("[v0] Unknown filename:", filename)
        return new NextResponse("File not found", { status: 404 })
      }

      return new NextResponse(content, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

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
