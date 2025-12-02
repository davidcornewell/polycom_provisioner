import { PhoneList } from "@/components/phone-list"
import { AddPhoneForm } from "@/components/add-phone-form"
import { GlobalSettings } from "@/components/global-settings"
import { Phone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Polycom Provisioning Server</h1>
          </div>
          <p className="text-muted-foreground">Manage configurations for Polycom SoundPoint IP 331 and 601 phones</p>
        </header>

        <Tabs defaultValue="phones" className="space-y-6">
          <TabsList>
            <TabsTrigger value="phones">Phones</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="phones">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <AddPhoneForm />
              </div>
              <div className="lg:col-span-2">
                <PhoneList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl">
              <GlobalSettings />
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 pt-8 border-t border-border">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Phone Configuration URLs</h3>
            <p className="text-sm text-muted-foreground mb-2">Point your Polycom phones to this provisioning server:</p>
            <code className="text-sm bg-background px-2 py-1 rounded block">
              {typeof window !== "undefined" ? window.location.origin : "https://your-server.com"}
              /api/provision/[MAC_ADDRESS]
            </code>
          </div>
        </footer>
      </div>
    </main>
  )
}
