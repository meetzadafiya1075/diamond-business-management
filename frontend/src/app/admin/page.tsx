"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Trash2, UserPlus, ShieldAlert } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

interface User {
  id: number
  username: string
  role: string
  date_joined: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  
  // New User Form State
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("WORKER")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // First check if user is admin
        const meRes = await fetch(`${API_BASE_URL}/auth/users/me/`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        if (!meRes.ok) throw new Error("Auth failed")
        
        const meData = await meRes.json()
        if (meData.role !== 'ADMIN') {
          setError("Access Denied: Admin role required")
          setLoading(false)
          return
        }

        setIsAdmin(true)

        // Fetch all users
        const usersRes = await fetch(`${API_BASE_URL}/auth/users/`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        if (!usersRes.ok) throw new Error("Failed to fetch users")
        
        const usersData = await usersRes.json()
        setUsers(usersData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetchUsers()
  }, [router])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = localStorage.getItem("access_token")

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: newUsername, 
          password: newPassword, 
          role: newRole 
        })
      })

      if (!res.ok) throw new Error("Failed to add user")

      const newUser = await res.json()
      setUsers([newUser, ...users])
      setNewUsername("")
      setNewPassword("")
      setNewRole("WORKER")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this user?")) return
    
    const token = localStorage.getItem("access_token")
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to delete user")
      
      setUsers(users.filter(u => u.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>

  if (!isAdmin) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4 text-red-500">
              <ShieldAlert className="h-12 w-12" />
            </div>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to view this page. Only administrators can access the User Management panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Add User Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Add New User
            </CardTitle>
            <CardDescription>Create a new user with a specific role.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <Input 
                  id="newUsername" 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRole">Role</Label>
                <Select value={newRole} onValueChange={(val) => setNewRole(val || "WORKER")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="OFFICE">Office</SelectItem>
                    <SelectItem value="WORKER">Worker</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Manage existing users and their permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
