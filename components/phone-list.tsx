"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Trash2, Copy, ExternalLink, Pencil } from "lucide-react"
import { EditPhoneDialog } from "./edit-phone-dialog"

interface PhoneConfig {
  mac: string
  model: string
  label: string
  sipUser: string
  displayName: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PhoneList() {
  const { data: phones, mutate, isLoading } = useSWR<PhoneConfig[]>("/api/phones", fetcher)
  const [editingPhone, setEditingPhone] = useState<PhoneConfig | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleDelete = async (mac: string) => {
    if (!confirm("Delete this phone configuration?")) return

    await fetch(`/api/phones?mac=${encodeURIComponent(mac)}`, {
      method: "DELETE",
    })
    mutate()
  }

  const handleEdit = (phone: PhoneConfig) => {
    setEditingPhone(phone)
    setEditDialogOpen(true)
  }

  const copyProvisionUrl = (mac: string) => {
    const url = `${window.location.origin}/api/provision/${mac.replace(/:/g, "").toLowerCase()}`
    navigator.clipboard.writeText(url)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading phones...</p>
        </CardContent>
      </Card>
    )
  }

  if (!phones || phones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No phones configured</h3>
            <p className="text-muted-foreground">Add a phone using the form to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configured Phones</CardTitle>
          <CardDescription>{phones.length} phone(s) registered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phones.map((phone) => (
              <div
                key={phone.mac}
                className="flex items-start justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{phone.mac}</span>
                    <Badge variant="secondary">IP {phone.model}</Badge>
                  </div>
                  <p className="font-medium">{phone.displayName}</p>
                  {phone.label && <p className="text-sm text-muted-foreground">{phone.label}</p>}
                  <p className="text-sm text-muted-foreground">SIP User: {phone.sipUser || "(not set)"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(phone)} title="Edit phone">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyProvisionUrl(phone.mac)}
                    title="Copy provision URL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" asChild title="View config">
                    <a
                      href={`/api/provision/${phone.mac.replace(/:/g, "").toLowerCase()}/config.cfg`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(phone.mac)}
                    title="Delete phone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditPhoneDialog
        phone={editingPhone}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={() => mutate()}
      />
    </>
  )
}
