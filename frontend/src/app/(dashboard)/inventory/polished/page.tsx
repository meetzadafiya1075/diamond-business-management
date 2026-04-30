"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Trash2, ExternalLink } from "lucide-react"
import { coreApi } from "@/lib/api"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PolishedInventoryPage() {
  const [stones, setStones] = useState<any[]>([])
  const [parcels, setParcels] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [stoneId, setStoneId] = useState("")
  const [carats, setCarats] = useState("")
  const [sourceParcel, setSourceParcel] = useState("")
  const [color, setColor] = useState("")
  const [clarity, setClarity] = useState("")
  const [certNo, setCertNo] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [stoneData, parcelData] = await Promise.all([
        coreApi.getPolishedStones(),
        coreApi.getRoughParcels()
      ])
      setStones(Array.isArray(stoneData) ? stoneData : stoneData.results || [])
      setParcels(Array.isArray(parcelData) ? parcelData : parcelData.results || [])
    } catch (err) {
      console.error("Failed to load inventory", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStone = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coreApi.createPolishedStone({
        stone_id: stoneId,
        carat_weight: carats,
        source_parcel: sourceParcel || null,
        color_grade: color,
        clarity_grade: clarity,
        certification_number: certNo,
        status: 'READY'
      })
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to add stone: ${err.message}`)
    }
  }

  const handleDeleteStone = async (id: number) => {
    if (!confirm("Are you sure you want to delete this stone from inventory?")) return
    try {
      await coreApi.deletePolishedStone(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredStones = stones.filter(stone => 
    stone.stone_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stone.certification_number && stone.certification_number.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polished Inventory</h1>
          <p className="text-muted-foreground mt-2">Manage your stock of certified polished diamonds.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Stock In Stone
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Polished Stone to Stock</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStone} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stone ID</Label>
                  <Input value={stoneId} onChange={e => setStoneId(e.target.value)} placeholder="e.g. DIA-001" required />
                </div>
                <div className="space-y-2">
                  <Label>Carats</Label>
                  <Input type="number" step="0.001" value={carats} onChange={e => setCarats(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Source Parcel (Optional)</Label>
                <Select value={sourceParcel} onValueChange={(val: string | null) => setSourceParcel(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin parcel" />
                  </SelectTrigger>
                  <SelectContent>
                    {parcels.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.parcel_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. D" />
                </div>
                <div className="space-y-2">
                  <Label>Clarity</Label>
                  <Input value={clarity} onChange={e => setClarity(e.target.value)} placeholder="e.g. VVS1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cert Number</Label>
                <Input value={certNo} onChange={e => setCertNo(e.target.value)} placeholder="GIA Cert #" />
              </div>
              <DialogFooter>
                <Button type="submit">Add to Inventory</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Stone ID or Cert #..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stone Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stone ID</TableHead>
                <TableHead>Source Parcel</TableHead>
                <TableHead className="text-right">Weight (ct)</TableHead>
                <TableHead>Color/Clarity</TableHead>
                <TableHead>Cert #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStones.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">No stones found.</TableCell></TableRow>
              ) : filteredStones.map((stone) => (
                <TableRow key={stone.id}>
                  <TableCell className="font-medium">{stone.stone_id}</TableCell>
                  <TableCell>{stone.source_parcel_name || 'N/A'}</TableCell>
                  <TableCell className="text-right">{stone.carat_weight}</TableCell>
                  <TableCell>{stone.color_grade}/{stone.clarity_grade}</TableCell>
                  <TableCell>
                    {stone.certification_number ? (
                      <div className="flex items-center gap-1">
                        {stone.certification_number}
                        {stone.certification_link && (
                          <a href={stone.certification_link} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3 w-3 text-blue-500" />
                          </a>
                        )}
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stone.status === 'READY' ? 'default' : 'secondary'}>
                      {stone.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteStone(stone.id)}
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
