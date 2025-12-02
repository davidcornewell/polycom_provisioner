import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

export interface PhoneConfig {
  mac: string
  model: "331" | "601"
  label: string
  sipUser: string
  sipPassword: string
  displayName: string
  createdAt: string
}

export interface ContactEntry {
  name: string
  extension: string
}

export interface GlobalConfig {
  sipServer: string
  sipPort: string
  contacts: ContactEntry[]
}

const DATA_FILE = join(process.cwd(), "data", "phones-data.json")

interface StoredData {
  phones: PhoneConfig[]
  globalConfig: GlobalConfig
}

function loadData(): StoredData {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8")
      return JSON.parse(raw)
    }
  } catch (error) {
    console.error("Error loading data file:", error)
  }
  return {
    phones: [],
    globalConfig: { sipServer: "", sipPort: "5060", contacts: [] },
  }
}

function saveData(): void {
  try {
    const dir = join(process.cwd(), "data")
    if (!existsSync(dir)) {
      const { mkdirSync } = require("fs")
      mkdirSync(dir, { recursive: true })
    }
    const data: StoredData = {
      phones: Array.from(phones.values()),
      globalConfig,
    }
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error("Error saving data file:", error)
  }
}

// Load initial data from file
const initialData = loadData()
const phones: Map<string, PhoneConfig> = new Map(initialData.phones.map((p) => [normalizeMac(p.mac), p]))
let globalConfig: GlobalConfig = initialData.globalConfig

export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig }
}

export function updateGlobalConfig(config: Partial<GlobalConfig>): GlobalConfig {
  globalConfig = { ...globalConfig, ...config }
  saveData() // Persist to file
  return globalConfig
}

export function normalizeMac(mac: string): string {
  return mac.replace(/[^a-fA-F0-9]/g, "").toLowerCase()
}

export function formatMac(mac: string): string {
  const normalized = normalizeMac(mac)
  return normalized.match(/.{2}/g)?.join(":").toUpperCase() || mac.toUpperCase()
}

export function getAllPhones(): PhoneConfig[] {
  return Array.from(phones.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPhone(mac: string): PhoneConfig | undefined {
  return phones.get(normalizeMac(mac))
}

export function addPhone(config: Omit<PhoneConfig, "createdAt">): PhoneConfig {
  const normalizedMac = normalizeMac(config.mac)
  const phone: PhoneConfig = {
    ...config,
    mac: formatMac(config.mac),
    createdAt: new Date().toISOString(),
  }
  phones.set(normalizedMac, phone)
  saveData() // Persist to file
  return phone
}

export function deletePhone(mac: string): boolean {
  const result = phones.delete(normalizeMac(mac))
  if (result) saveData() // Persist to file
  return result
}

export function updatePhone(mac: string, updates: Partial<Omit<PhoneConfig, "mac" | "createdAt">>): PhoneConfig | null {
  const normalizedMac = normalizeMac(mac)
  const existing = phones.get(normalizedMac)

  if (!existing) {
    return null
  }

  const updated: PhoneConfig = {
    ...existing,
    ...updates,
  }

  phones.set(normalizedMac, updated)
  saveData() // Persist to file
  return updated
}

export function autoRegisterPhone(mac: string): PhoneConfig {
  const normalizedMac = normalizeMac(mac)

  // Check if already exists
  const existing = phones.get(normalizedMac)
  if (existing) {
    return existing
  }

  const phone: PhoneConfig = {
    mac: formatMac(mac),
    model: "331",
    label: `Auto-registered ${formatMac(mac)}`,
    sipUser: "",
    sipPassword: "",
    displayName: `Phone ${formatMac(mac).slice(-8)}`,
    createdAt: new Date().toISOString(),
  }

  phones.set(normalizedMac, phone)
  saveData() // Persist to file
  return phone
}
