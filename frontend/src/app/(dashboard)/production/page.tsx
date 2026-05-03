"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { coreApi, authApi } from "@/lib/api"
import { useUser } from "@/hooks/useUser"
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
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

export default function ProductionPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [parcels, setParcels] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { isPlanner, isWorker, isAdmin } = useUser()
  const canManage = isAdmin || isPlanner

  // Form State
  const [selectedParcel, setSelectedParcel] = useState("")
  const [selectedWorker, setSelectedWorker] = useState("")
  const [selectedStage, setSelectedStage] = useState("MARKING")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [jobData, parcelData, userData] = await Promise.all([
        coreApi.getProductionJobs(),
        coreApi.getRoughParcels(),
        authApi.getUsers()
      ])
      
      setJobs(Array.isArray(jobData) ? jobData : jobData.results || [])
      setParcels(Array.isArray(parcelData) ? parcelData : parcelData.results || [])
      setWorkers(Array.isArray(userData) ? userData : userData.results || [])
    } catch (err) {
      console.error("Failed to load production data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      await coreApi.updateProductionJob(jobId, { status: newStatus })
      loadData()
    } catch (err) {
      console.error("Status update failed", err)
      alert("Failed to update status")
    }
  }

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to delete this production job?")) return
    try {
      await coreApi.deleteProductionJob(id)
      loadData()
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  const handleAssignJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coreApi.createProductionJob({
        parcel: selectedParcel,
        assigned_worker: selectedWorker,
        stage: selectedStage,
        notes: notes,
        status: 'IN_PROGRESS'
      })
      
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      alert(`Failed to assign job: ${err.message}`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Board</h1>
          <p className="text-muted-foreground mt-2">Monitor active jobs and manufacturing stages.</p>
        </div>
        
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                + Assign Job
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign New Production Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignJob} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Parcel</Label>
                  <Select value={selectedParcel} onValueChange={(val: string | null) => setSelectedParcel(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose parcel" />
                    </SelectTrigger>
                    <SelectContent>
                      {parcels.length === 0 ? (
                        <SelectItem value="none" disabled>No parcels available.</SelectItem>
                      ) : parcels.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.parcel_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Worker</Label>
                  <Select value={selectedWorker} onValueChange={(val: string | null) => setSelectedWorker(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.filter(u => u.role?.toUpperCase() === 'WORKER').length === 0 ? (
                        <SelectItem value="none" disabled>No workers found.</SelectItem>
                      ) : workers.filter(u => u.role?.toUpperCase() === 'WORKER').map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Initial Stage</Label>
                  <Select value={selectedStage} onValueChange={(val: string | null) => setSelectedStage(val || "MARKING")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKING">Marking</SelectItem>
                      <SelectItem value="SAWING">Sawing / Lasering</SelectItem>
                      <SelectItem value="BRUTING">Bruting</SelectItem>
                      <SelectItem value="POLISHING">Polishing</SelectItem>
                      <SelectItem value="QC">Quality Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional instructions" />
                </div>
                <DialogFooter>
                  <Button type="submit">Assign Job</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Production Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Parcel</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">No active jobs found.</TableCell></TableRow>
              ) : jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">#{job.id}</TableCell>
                  <TableCell>{job.parcel_name || `Parcel #${job.parcel}`}</TableCell>
                  <TableCell>{job.worker_name || `User #${job.assigned_worker}`}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    {(isWorker || isAdmin) ? (
                      <Select 
                        value={job.status} 
                        onValueChange={(val: string | null) => handleStatusChange(job.id, val || job.status)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={job.status === 'DONE' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{job.assigned_date ? new Date(job.assigned_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
