"use client"

import type React from "react"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddPhoneForm() {
  const { mutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    mac: "",
    model: "331",
    label: "",
    sipUser: "",
    sipPassword: "",
    displayName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          mac: "",
          model: "331",
          label: "",
          sipUser: "",
          sipPassword: "",
          displayName: "",
        })
        mutate("/api/phones")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatMac = (value: string) => {
    const cleaned = value.replace(/[^a-fA-F0-9]/g, "").toUpperCase()
    const parts = cleaned.match(/.{1,2}/g) || []
    return parts.slice(0, 6).join(":")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Phone
        </CardTitle>
        <CardDescription>Register a new Polycom phone for provisioning</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mac">MAC Address</Label>
            <Input
              id="mac"
              placeholder="00:04:F2:XX:XX:XX"
              value={formData.mac}
              onChange={(e) => setFormData({ ...formData, mac: formatMac(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Phone Model</Label>
            <Select value={formData.model} onValueChange={(v) => setFormData({ ...formData, model: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="331">SoundPoint IP 331</SelectItem>
                <SelectItem value="601">SoundPoint IP 601</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label / Location</Label>
            <Input
              id="label"
              placeholder="e.g., Front Desk"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="e.g., John Smith"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sipUser">SIP Username / Extension</Label>
            <Input
              id="sipUser"
              placeholder="1001"
              value={formData.sipUser}
              onChange={(e) => setFormData({ ...formData, sipUser: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sipPassword">SIP Password</Label>
            <Input
              id="sipPassword"
              type="password"
              placeholder="••••••••"
              value={formData.sipPassword}
              onChange={(e) => setFormData({ ...formData, sipPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Phone"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
