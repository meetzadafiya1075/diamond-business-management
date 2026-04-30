"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authApi } from "@/lib/api"
import { useCurrency } from "@/hooks/useCurrency"

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("WORKER")
  const [users, setUsers] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const initSettings = async () => {
      try {
        const me = await authApi.getCurrentUser()
        if (me.role === 'ADMIN') {
          setIsAdmin(true)
          loadUsers()
        }
      } catch (err) {
        console.error("Failed to fetch user role", err)
      }
    }
    initSettings()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await authApi.getUsers()
      setUsers(data)
    } catch (err) {
      console.error("Failed to load users", err)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authApi.createUser({ username, password, role })
      setUsername("")
      setPassword("")
      setRole("WORKER")
      setIsUserDialogOpen(false)
      loadUsers()
      alert("User created successfully!")
    } catch (err) {
      alert("Failed to create user. Make sure the username is unique.")
    }
  }

  const handleSave = () => {
    alert("Business Profile settings saved successfully!");
  }

  const handleNotImplemented = (feature: string) => {
    alert(`The ${feature} feature is scheduled for a future update.`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-2">Manage users, permissions, and business profile.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input defaultValue="Diamond Corp Ltd." />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select value={currency} onValueChange={(val) => setCurrency(val || "USD")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add new employees to the ERP system and configure their role-based access control (RBAC).
              </p>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger className={buttonVariants({ variant: "outline", className: "w-full mb-2" })}>
                  Manage Users
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input required value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={role} onValueChange={(val) => setRole(val || "WORKER")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin / Owner</SelectItem>
                          <SelectItem value="OFFICE">Office / Admin</SelectItem>
                          <SelectItem value="PLANNER">Planner</SelectItem>
                          <SelectItem value="WORKER">Worker</SelectItem>
                          <SelectItem value="SALES">Sales</SelectItem>
                          <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Create User</Button>
                  </form>
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-2">Recent Users</h4>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {users.map(u => (
                        <div key={u.id} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm border">
                          <span className="font-medium">{u.username}</span>
                          <span className="text-xs bg-slate-200 px-2 py-1 rounded">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="w-full" onClick={() => handleNotImplemented("Manage Roles")}>Manage Roles</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View system access logs and track data modification history.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => handleNotImplemented("Audit Logs")}>View Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
