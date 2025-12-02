"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PhoneConfig {
  mac: string
  model: string
  label: string
  sipUser: string
  displayName: string
}

interface EditPhoneDialogProps {
  phone: PhoneConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function EditPhoneDialog({ phone, open, onOpenChange, onSave }: EditPhoneDialogProps) {
  const [model, setModel] = useState("331")
  const [label, setLabel] = useState("")
  const [sipUser, setSipUser] = useState("")
  const [sipPassword, setSipPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (phone) {
      setModel(phone.model)
      setLabel(phone.label)
      setSipUser(phone.sipUser)
      setDisplayName(phone.displayName)
      setSipPassword("") // Don't prefill password for security
    }
  }, [phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    setIsSubmitting(true)

    const updates: Record<string, string> = {
      mac: phone.mac,
      model,
      label,
      sipUser,
      displayName,
    }

    // Only include password if it was changed
    if (sipPassword) {
      updates.sipPassword = sipPassword
    }

    await fetch("/api/phones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    setIsSubmitting(false)
    onOpenChange(false)
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Phone</DialogTitle>
          <DialogDescription>Update configuration for {phone?.mac}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-model">Phone Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="edit-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="331">IP 331</SelectItem>
                  <SelectItem value="601">IP 601</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-label">Label (optional)</Label>
              <Input
                id="edit-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Reception Desk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sipUser">SIP Username</Label>
              <Input
                id="edit-sipUser"
                value={sipUser}
                onChange={(e) => setSipUser(e.target.value)}
                placeholder="1001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sipPassword">SIP Password</Label>
              <Input
                id="edit-sipPassword"
                type="password"
                value={sipPassword}
                onChange={(e) => setSipPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
