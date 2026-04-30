"use client"
import { useState, useEffect } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { coreApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency"

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
  const [purchaseDate, setPurchaseDate] = useState("")
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
      setParcels(parcelData)
      setSuppliers(supplierData)
    } catch (err: any) {
      if (err.message.includes('Authentication') || err.message.includes('credential')) {
        router.push('/login')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coreApi.createSupplier({ name: newSupplierName })
      setNewSupplierName("")
      setIsSupplierDialogOpen(false)
      loadData() // Reload suppliers
    } catch (err) {
      console.error("Failed to add supplier", err)
    }
  }

  const handleAddParcel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await coreApi.createRoughParcel({
        supplier: supplierId,
        parcel_name: parcelName,
        purchase_date: purchaseDate,
        carat_weight: parseFloat(caratWeight),
        cost_per_carat: parseFloat(costPerCarat),
      })
      
      // Reset form
      setParcelName("")
      setSupplierId("")
      setPurchaseDate("")
      setCaratWeight("")
      setCostPerCarat("")
      setIsParcelDialogOpen(false)
      loadData() // Reload parcels
    } catch (err) {
      console.error("Failed to add parcel", err)
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
            <DialogTrigger className={buttonVariants({ variant: "outline" })}>
              + New Supplier
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input required value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} />
                </div>
                <Button type="submit">Save Supplier</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isParcelDialogOpen} onOpenChange={setIsParcelDialogOpen}>
            <DialogTrigger className={buttonVariants()}>
              + New Purchase
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Rough Parcel</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddParcel} className="space-y-4">
                <div className="space-y-2">
                  <Label>Parcel ID / Name</Label>
                  <Input required value={parcelName} onChange={e => setParcelName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select onValueChange={(val: string | null) => setSupplierId(val || "")} required>
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
                    <Input type="number" step="0.01" required value={caratWeight} onChange={e => setCaratWeight(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per ct ({symbol})</Label>
                    <Input type="number" step="0.01" required value={costPerCarat} onChange={e => setCostPerCarat(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Save Parcel</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No purchases found.</TableCell></TableRow>
                ) : parcels.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.parcel_name}</TableCell>
                    <TableCell>{p.supplier_name || 'Unknown'}</TableCell>
                    <TableCell>{p.purchase_date}</TableCell>
                    <TableCell className="text-right">{p.carat_weight}</TableCell>
                    <TableCell className="text-right">{symbol}{p.cost_per_carat}</TableCell>
                    <TableCell className="text-right">{symbol}{p.total_cost}</TableCell>
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
