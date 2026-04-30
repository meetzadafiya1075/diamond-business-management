"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authApi } from "@/lib/api"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, UserPlus } from "lucide-react"

export default function WorkerManagementPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("WORKER")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await authApi.getUsers()
      setWorkers(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error("Failed to load workers", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authApi.createUser({
        username,
        password,
        role
      })
      setIsDialogOpen(false)
      setUsername("")
      setPassword("")
      loadData()
    } catch (err: any) {
      console.error(err)
      alert(`Failed to add worker: ${err.message}`)
    }
  }

  const handleDeleteWorker = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return
    try {
      await authApi.deleteUser(id)
      loadData()
    } catch (err) {
      console.error("Delete failed", err)
      alert("Failed to delete user. You might not have permission.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
          <p className="text-muted-foreground mt-2">Manage your team, roles, and access permissions.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(val: string | null) => setRole(val || "WORKER")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKER">Worker (Production)</SelectItem>
                    <SelectItem value="PLANNER">Planner (Management)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.username}</TableCell>
                    <TableCell>
                      <Badge variant={worker.role === 'ADMIN' ? 'default' : 'outline'}>
                        {worker.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(worker.date_joined).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Badge className="bg-green-600">Active</Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteWorker(worker.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
