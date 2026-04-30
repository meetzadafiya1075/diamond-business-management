"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { authApi } from "@/lib/api"
import { useCurrency } from "@/hooks/useCurrency"
import { Shield, List, Save, UserCog } from "lucide-react"

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency()
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initSettings()
  }, [])

  const initSettings = async () => {
    try {
      // Fetch data directly. If user isn't ADMIN, the API will reject it anyway.
      const me = await authApi.getCurrentUser()
      setIsAdmin(me.role === 'ADMIN')
      
      if (me.role === 'ADMIN') {
        loadData()
      }
    } catch (err) {
      console.error("Failed to fetch settings", err)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      const [userData, logData] = await Promise.all([
        authApi.getUsers().catch(() => ({ results: [] })),
        authApi.getLogs().catch(() => ({ results: [] }))
      ])
      
      // Handle both array and paginated formats
      const finalUsers = Array.isArray(userData) ? userData : (userData as any).results || []
      const finalLogs = Array.isArray(logData) ? logData : (logData as any).results || []
      
      setUsers(finalUsers)
      setLogs(finalLogs)
      console.log("Loaded Settings Data:", { users: finalUsers.length, logs: finalLogs.length })
    } catch (err) {
      console.error("Failed to load settings data", err)
    }
  }

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await authApi.updateUser(userId, { role: newRole })
      loadData()
      alert("Role updated successfully!")
    } catch (err) {
      alert("Failed to update role.")
    }
  }

  const handleSaveProfile = () => {
    alert("Business Profile settings saved successfully!");
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
              <Select value={currency} onValueChange={(val: string | null) => setCurrency(val || "USD")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure user permissions and view system audit trails.
              </p>
              
              <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogTrigger>
                  <div className="w-full h-10 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent inline-flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <UserCog className="h-4 w-4" /> Manage Roles
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Manage User Roles</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Current Role</TableHead>
                          <TableHead className="text-right">Change To</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.username}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'ADMIN' ? 'default' : 'outline'}>{u.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Select onValueChange={(val: string | null) => handleUpdateRole(u.id, val || u.role)}>
                                <SelectTrigger className="w-[130px] ml-auto">
                                  <SelectValue placeholder="Update role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                  <SelectItem value="PLANNER">Planner</SelectItem>
                                  <SelectItem value="WORKER">Worker</SelectItem>
                                  <SelectItem value="OFFICE">Office</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
                <DialogTrigger>
                  <div className="w-full h-10 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 inline-flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <List className="h-4 w-4" /> View Audit Logs
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>System Audit Logs</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 overflow-y-auto flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center">No logs found.</TableCell></TableRow>
                        ) : logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.username}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">{log.details || '-'}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
