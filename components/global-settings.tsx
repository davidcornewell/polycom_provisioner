"use client"
import { useState, useEffect } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Plus, Trash2, Users } from "lucide-react"

interface ContactEntry {
  name: string
  extension: string
}

interface GlobalConfig {
  sipServer: string
  sipPort: string
  contacts: ContactEntry[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GlobalSettings() {
  const { data: settings, isLoading } = useSWR<GlobalConfig>("/api/settings", fetcher)
  const { mutate } = useSWRConfig()
  const [isSaving, setIsSaving] = useState(false)
  const [sipServer, setSipServer] = useState("")
  const [sipPort, setSipPort] = useState("5060")
  const [contacts, setContacts] = useState<ContactEntry[]>([])
  const [newContact, setNewContact] = useState({ name: "", extension: "" })

  useEffect(() => {
    if (settings) {
      setSipServer(settings.sipServer)
      setSipPort(settings.sipPort)
      setContacts(settings.contacts)
    }
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sipServer, sipPort, contacts }),
      })
      mutate("/api/settings")
    } finally {
      setIsSaving(false)
    }
  }

  const addContact = () => {
    if (newContact.name && newContact.extension) {
      setContacts([...contacts, { ...newContact }])
      setNewContact({ name: "", extension: "" })
    }
  }

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading settings...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SIP Server Settings
          </CardTitle>
          <CardDescription>Configure the SIP server for all phones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sipServer">SIP Server Address</Label>
              <Input
                id="sipServer"
                placeholder="sip.example.com"
                value={sipServer}
                onChange={(e) => setSipServer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sipPort">SIP Port</Label>
              <Input id="sipPort" placeholder="5060" value={sipPort} onChange={(e) => setSipPort(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contact Directory
          </CardTitle>
          <CardDescription>Shared contact list for all phones (speed dial)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Contact Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="Extension"
              value={newContact.extension}
              onChange={(e) => setNewContact({ ...newContact, extension: e.target.value })}
              className="w-32"
            />
            <Button type="button" variant="outline" size="icon" onClick={addContact}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {contacts.length > 0 ? (
            <div className="divide-y divide-border rounded-md border">
              {contacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <div>
                    <span className="font-medium">{contact.name}</span>
                    <span className="ml-2 text-muted-foreground">ext. {contact.extension}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeContact(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No contacts added yet</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  )
}
