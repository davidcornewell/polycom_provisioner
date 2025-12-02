import { NextResponse } from "next/server"

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<APPLICATION APP_FILE_PATH="sip.ld" CONFIG_FILES="" MISC_FILES="" LOG_FILE_DIRECTORY="" OVERRIDES_DIRECTORY="" CONTACTS_DIRECTORY="">
  <APPLICATION_SPIP601 APP_FILE_PATH_SPIP601="sip.ld" CONFIG_FILES_SPIP601="phone.cfg, sip.cfg" />
  <APPLICATION_SPIP331 APP_FILE_PATH_SPIP331="sip.ld" CONFIG_FILES_SPIP331="phone.cfg, sip.cfg" />
</APPLICATION>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
