import type { PhoneConfig, ContactEntry, GlobalConfig } from "./phones-store"

export function generateMasterConfig(phone: PhoneConfig, baseUrl: string): string {
  // Use normalized MAC for config file names
  const normalizedMac = phone.mac.replace(/[^a-fA-F0-9]/g, "").toLowerCase()

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<APPLICATION APP_FILE_PATH="sip.ld" CONFIG_FILES="${normalizedMac}-phone.cfg, ${normalizedMac}-sip.cfg, ${normalizedMac}-directory.xml" MISC_FILES="" LOG_FILE_DIRECTORY="" OVERRIDES_DIRECTORY="" CONTACTS_DIRECTORY="">
</APPLICATION>`
}

export function generateBootromConfig(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<PHONE_CONFIG>
  <BOOT_CONFIG />
</PHONE_CONFIG>`
}

export function generatePhoneConfig(phone: PhoneConfig): string {
  const isIP601 = phone.model === "601"

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<phone1>
  <reg reg.1.displayName="${phone.displayName}" reg.1.label="${phone.label}" />
  <tcpIpApp>
    <sntp tcpIpApp.sntp.address="pool.ntp.org" />
  </tcpIpApp>
  <dialplan dialplan.digitmap="[2-9]11|0T|011xxx.T|[0-1][2-9]xxxxxxxxx|[2-9]xxxxxxxxx|[2-9]xxx|*xx.T" />
  ${isIP601 ? `<lcd lcd.backlight.onIntensity="2" lcd.backlight.idleIntensity="1" />` : ""}
  <up up.oneTouchVoiceMail="1" />
</phone1>`
}

export function generateSipConfig(phone: PhoneConfig, globalConfig: GlobalConfig): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sip>
  <reg reg.1.server.1.address="${globalConfig.sipServer}" 
       reg.1.server.1.port="${globalConfig.sipPort}"
       reg.1.auth.userId="${phone.sipUser}"
       reg.1.auth.password="${phone.sipPassword}"
       reg.1.address="${phone.sipUser}" />
  <voIpProt voIpProt.server.1.address="${globalConfig.sipServer}" voIpProt.server.1.port="${globalConfig.sipPort}" />
</sip>`
}

export function generateDirectoryConfig(contacts: ContactEntry[]): string {
  const items = contacts
    .map(
      (contact, index) =>
        `  <item>
    <ln>${contact.name}</ln>
    <ct>${contact.extension}</ct>
    <sd>${index + 1}</sd>
  </item>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<directory>
  <item_list>
${items}
  </item_list>
</directory>`
}
