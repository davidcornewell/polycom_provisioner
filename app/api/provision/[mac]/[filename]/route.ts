import { NextResponse } from "next/server"
import { autoRegisterPhone, normalizeMac, getGlobalConfig } from "@/lib/phones-store"
import {
  generateMasterConfig,
  generatePhoneConfig,
  generateSipConfig,
  generateBootromConfig,
  generateDirectoryConfig,
} from "@/lib/polycom-templates"

export async function GET(request: Request, { params }: { params: Promise<{ mac: string; filename: string }> }) {
  const { mac, filename } = await params
  const normalizedMac = normalizeMac(mac)

  const phone = autoRegisterPhone(normalizedMac)
  const globalConfig = getGlobalConfig()

  if (!phone) {
    return new NextResponse("Phone registration failed", { status: 500 })
  }

  const baseUrl = new URL(request.url).origin
  let content: string
  const contentType = "application/xml"

  // Handle different config file requests
  const lowerFilename = filename.toLowerCase()

  if (lowerFilename === "000000000000.cfg" || lowerFilename === `${normalizedMac}.cfg`) {
    content = generateMasterConfig(phone, baseUrl)
  } else if (lowerFilename === `${normalizedMac}-phone.cfg` || lowerFilename === "phone.cfg") {
    content = generatePhoneConfig(phone)
  } else if (lowerFilename === `${normalizedMac}-sip.cfg` || lowerFilename === "sip.cfg") {
    content = generateSipConfig(phone, globalConfig)
  } else if (lowerFilename === "bootrom.cfg") {
    content = generateBootromConfig()
  } else if (lowerFilename === `${normalizedMac}-directory.xml` || lowerFilename === "directory.xml") {
    content = generateDirectoryConfig(globalConfig.contacts)
  } else if (lowerFilename === "config.cfg") {
    content = `<!-- MASTER CONFIG -->\n${generateMasterConfig(phone, baseUrl)}\n\n<!-- PHONE CONFIG -->\n${generatePhoneConfig(phone)}\n\n<!-- SIP CONFIG -->\n${generateSipConfig(phone, globalConfig)}\n\n<!-- DIRECTORY -->\n${generateDirectoryConfig(globalConfig.contacts)}`
  } else {
    return new NextResponse("File not found", { status: 404 })
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
