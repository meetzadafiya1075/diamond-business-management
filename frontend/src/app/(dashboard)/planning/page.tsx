"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { coreApi, authApi } from "@/lib/api"
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
import { Trash2 } from "lucide-react"

export default function PlanningPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [parcels, setParcels] = useState<any[]>([])
  const [planners, setPlanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [selectedParcel, setSelectedParcel] = useState("")
  const [selectedPlanner, setSelectedPlanner] = useState("")
  const [yieldPercent, setYieldPercent] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [planData, parcelData, userData] = await Promise.all([
        coreApi.getPlanningRecords(),
        coreApi.getRoughParcels(),
        authApi.getUsers()
      ])
      
      // Handle both direct array and paginated results
      setPlans(Array.isArray(planData) ? planData : planData.results || [])
      setParcels(Array.isArray(parcelData) ? parcelData : parcelData.results || [])
      
      const allUsers = Array.isArray(userData) ? userData : userData.results || []
      // For now, allow any user to be a planner to avoid empty lists for new setups
      setPlanners(allUsers)
    } catch (err) {
      console.error("Failed to load planning data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPlanning = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parcelObj = parcels.find(p => p.id.toString() === selectedParcel)
      const polishedCt = (parseFloat(parcelObj.carat_weight) * parseFloat(yieldPercent)) / 100

      await coreApi.createPlanningRecord({
        parcel: selectedParcel,
        planner: selectedPlanner,
        expected_yield_percent: yieldPercent,
        expected_polished_carats: polishedCt.toFixed(3),
        planning_notes: notes
      })
      
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      alert(`Failed to assign planning: ${err.message}`)
    }
  }

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Are you sure you want to delete this planning record?")) return
    try {
      await coreApi.deletePlanningRecord(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning Board</h1>
          <p className="text-muted-foreground mt-2">Assign rough parcels and calculate expected yield.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
              + Assign Planning
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Parcel to Planning</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignPlanning} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Rough Parcel</Label>
                <Select value={selectedParcel} onValueChange={(val: string | null) => setSelectedParcel(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose parcel" />
                  </SelectTrigger>
                  <SelectContent>
                    {parcels.length === 0 ? (
                      <SelectItem value="none" disabled>No parcels available. Add some in Rough Purchase.</SelectItem>
                    ) : parcels.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.parcel_name} ({p.carat_weight} ct)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Planner</Label>
                <Select value={selectedPlanner} onValueChange={(val: string | null) => setSelectedPlanner(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select planner" />
                  </SelectTrigger>
                  <SelectContent>
                    {planners.length === 0 ? (
                      <SelectItem value="none" disabled>No users found.</SelectItem>
                    ) : planners.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Yield (%)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g. 38.5" 
                  value={yieldPercent}
                  onChange={e => setYieldPercent(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
              </div>
              <DialogFooter>
                <Button type="submit">Create Plan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Planning Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead className="text-right">Rough Weight</TableHead>
                <TableHead>Planner</TableHead>
                <TableHead className="text-right">Expected Yield</TableHead>
                <TableHead className="text-right">Exp. Polished</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No planning records found.</TableCell></TableRow>
              ) : plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.parcel_name || `Parcel #${p.parcel}`}</TableCell>
                  <TableCell className="text-right">{p.rough_weight} ct</TableCell>
                  <TableCell>{p.planner_name || 'N/A'}</TableCell>
                  <TableCell className="text-right">{p.expected_yield_percent}%</TableCell>
                  <TableCell className="text-right">{p.expected_polished_carats} ct</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeletePlan(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
