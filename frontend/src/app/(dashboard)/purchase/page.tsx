"use client"
import { useState, useEffect } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { coreApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency"
import { Trash2, ShoppingCart, UserPlus, PackagePlus } from "lucide-react"

export default function RoughPurchasePage() {
  const { symbol } = useCurrency()
  const [parcels, setParcels] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form States
  const [newSupplierName, setNewSupplierName] = useState("")
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)

  const [parcelName, setParcelName] = useState("")
  const [supplierId, setSupplierId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [caratWeight, setCaratWeight] = useState("")
  const [costPerCarat, setCostPerCarat] = useState("")
  const [isParcelDialogOpen, setIsParcelDialogOpen] = useState(false)

  const router = useRouter()

  const loadData = async () => {
    try {
      const [parcelData, supplierData] = await Promise.all([
        coreApi.getRoughParcels(),
        coreApi.getSuppliers()
      ])
      setParcels(Array.isArray(parcelData) ? parcelData : parcelData.results || [])
      setSuppliers(Array.isArray(supplierData) ? supplierData : supplierData.results || [])
    } catch (err: any) {
      console.error("Failed to load purchase data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteParcel = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await coreApi.deleteRoughParcel(id)
      loadData()
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coreApi.createSupplier({ name: newSupplierName })
      setNewSupplierName("")
      setIsSupplierDialogOpen(false)
      loadData()
    } catch (err) {
      alert("Failed to add supplier.")
    }
  }

  const handleAddParcel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coreApi.createRoughParcel({
        supplier: supplierId,
        parcel_name: parcelName,
        purchase_date: purchaseDate,
        carat_weight: caratWeight,
        cost_per_carat: costPerCarat,
      })
      
      setParcelName("")
      setSupplierId("")
      setCaratWeight("")
      setCostPerCarat("")
      setIsParcelDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to add parcel: ${err.message || "Please check all fields"}`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rough Purchase</h1>
          <p className="text-muted-foreground mt-2">Manage your rough diamond inward entries.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
            <DialogTrigger>
              <div className="bg-outline text-outline-foreground border border-input hover:bg-accent h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4" /> New Supplier
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSupplier} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input required value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Supplier</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isParcelDialogOpen} onOpenChange={setIsParcelDialogOpen}>
            <DialogTrigger>
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                <PackagePlus className="mr-2 h-4 w-4" /> New Purchase
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Rough Parcel</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddParcel} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Parcel ID / Name</Label>
                  <Input required value={parcelName} onChange={e => setParcelName(e.target.value)} placeholder="e.g. R-101" />
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={supplierId} onValueChange={(val: string | null) => setSupplierId(val || "")} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" required value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (ct)</Label>
                    <Input type="number" step="0.001" required value={caratWeight} onChange={e => setCaratWeight(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per ct ({symbol})</Label>
                    <Input type="number" step="0.01" required value={costPerCarat} onChange={e => setCostPerCarat(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Save Parcel</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcel ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Weight (ct)</TableHead>
                  <TableHead className="text-right">Cost / ct</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center">No purchases found.</TableCell></TableRow>
                ) : parcels.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.parcel_name}</TableCell>
                    <TableCell>{p.supplier_name || 'Unknown'}</TableCell>
                    <TableCell>{p.purchase_date}</TableCell>
                    <TableCell className="text-right">{p.carat_weight}</TableCell>
                    <TableCell className="text-right">{symbol}{p.cost_per_carat}</TableCell>
                    <TableCell className="text-right">{symbol}{p.total_cost}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteParcel(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
