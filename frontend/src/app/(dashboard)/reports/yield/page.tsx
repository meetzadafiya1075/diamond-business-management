"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { coreApi } from "@/lib/api"
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
import { BarChart3, Plus, Trash2, TrendingUp } from "lucide-react"

export default function YieldReportPage() {
  const [reports, setReports] = useState<any[]>([])
  const [parcels, setParcels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [selectedParcelId, setSelectedParcelId] = useState("")
  const [polishedWeight, setPolishedWeight] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [reportData, parcelData] = await Promise.all([
        coreApi.getYieldReports(),
        coreApi.getRoughParcels()
      ])
      setReports(Array.isArray(reportData) ? reportData : reportData.results || [])
      setParcels(Array.isArray(parcelData) ? parcelData : parcelData.results || [])
    } catch (err) {
      console.error("Failed to load reports", err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    const parcel = parcels.find(p => p.id.toString() === selectedParcelId)
    if (!parcel) return

    const rough = parseFloat(parcel.carat_weight)
    const polished = parseFloat(polishedWeight)
    const yieldPct = (polished / rough) * 100
    const loss = rough - polished

    try {
      await coreApi.createYieldReport({
        parcel: selectedParcelId,
        rough_weight: rough,
        polished_weight: polished,
        yield_percentage: yieldPct.toFixed(2),
        loss_weight: loss.toFixed(3)
      })
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to generate report: ${err.message}`)
    }
  }

  const handleDeleteReport = async (id: number) => {
    if (!confirm("Delete this report?")) return
    try {
      await coreApi.deleteYieldReport(id)
      loadData()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yield & Loss Analysis</h1>
          <p className="text-muted-foreground mt-2">Monitor manufacturing efficiency and stone weight retention.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Generate Report
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Yield Analysis</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Finished Parcel</Label>
                <Select value={selectedParcelId} onValueChange={(val: string | null) => setSelectedParcelId(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose parcel" />
                  </SelectTrigger>
                  <SelectContent>
                    {parcels.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.parcel_name} ({p.carat_weight} ct)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Final Polished Weight (ct)</Label>
                <Input 
                  type="number" 
                  step="0.001" 
                  value={polishedWeight} 
                  onChange={e => setPolishedWeight(e.target.value)} 
                  placeholder="Total weight of all stones produced"
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="submit">Calculate & Save Report</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 
                ? (reports.reduce((acc, r) => acc + parseFloat(r.yield_percentage), 0) / reports.length).toFixed(2) 
                : "0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manufacturing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel</TableHead>
                <TableHead className="text-right">Rough (ct)</TableHead>
                <TableHead className="text-right">Polished (ct)</TableHead>
                <TableHead className="text-right">Yield %</TableHead>
                <TableHead className="text-right">Loss (ct)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No reports generated yet.</TableCell></TableRow>
              ) : reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.parcel_name || `Parcel #${report.parcel}`}</TableCell>
                  <TableCell className="text-right">{report.rough_weight}</TableCell>
                  <TableCell className="text-right">{report.polished_weight}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={parseFloat(report.yield_percentage) > 40 ? 'default' : 'secondary'}>
                      {report.yield_percentage}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-red-600">-{report.loss_weight}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteReport(report.id)}>
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
