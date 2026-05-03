"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { businessApi, coreApi } from "@/lib/api"
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
import { Trash2, Plus, UserPlus, FileText } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"
import { useUser } from "@/hooks/useUser"

export default function SalesCRMPage() {
  const { symbol } = useCurrency()
  const { isSales, isOffice, isAdmin } = useUser()
  const [buyers, setBuyers] = useState<any[]>([])
  const [quotations, setQuotations] = useState<any[]>([])
  const [stones, setStones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog States
  const [isBuyerDialogOpen, setIsBuyerDialogOpen] = useState(false)
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false)

  // Buyer Form State
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")

  // Quote Form State
  const [selectedBuyer, setSelectedBuyer] = useState("")
  const [selectedStone, setSelectedStone] = useState("")
  const [offeredPrice, setOfferedPrice] = useState("")
  const [terms, setTerms] = useState("Standard 7-day payment")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [buyerData, quoteData, stoneData] = await Promise.all([
        businessApi.getBuyers(),
        businessApi.getQuotations(),
        coreApi.getPolishedStones()
      ])
      setBuyers(Array.isArray(buyerData) ? buyerData : buyerData.results || [])
      setQuotations(Array.isArray(quoteData) ? quoteData : quoteData.results || [])
      setStones(Array.isArray(stoneData) ? stoneData : stoneData.results || [])
    } catch (err) {
      console.error("Failed to load CRM data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await businessApi.createBuyer({ company_name: companyName, contact_person: contactPerson, email })
      setIsBuyerDialogOpen(false)
      setCompanyName("")
      setContactPerson("")
      loadData()
    } catch (err: any) {
      alert(`Failed to add buyer: ${err.message}`)
    }
  }

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await businessApi.createQuotation({
        buyer: selectedBuyer,
        stone: selectedStone,
        proposed_price: offeredPrice,
        status: 'PENDING'
      })
      setIsQuoteDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to create quotation: ${err.message}`)
    }
  }

  const handleDeleteBuyer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this buyer?")) return
    try {
      await businessApi.deleteBuyer(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteQuotation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return
    try {
      await businessApi.deleteQuotation(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales CRM</h1>
          <p className="text-muted-foreground mt-2">Manage customer relationships and track sales quotations.</p>
        </div>
        {(isSales || isOffice || isAdmin) && (
          <div className="flex gap-2">
            <Dialog open={isBuyerDialogOpen} onOpenChange={setIsBuyerDialogOpen}>
              <DialogTrigger>
                <div className="bg-outline text-outline-foreground border border-input hover:bg-accent h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Buyer
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Buyer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBuyer} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Buyer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
              <DialogTrigger>
                <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" /> New Quotation
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Sales Quotation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateQuotation} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Buyer</Label>
                    <Select value={selectedBuyer} onValueChange={(val: string | null) => setSelectedBuyer(val || "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map(b => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.company_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Stone</Label>
                    <Select value={selectedStone} onValueChange={(val: string | null) => setSelectedStone(val || "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose stone from inventory" />
                      </SelectTrigger>
                      <SelectContent>
                        {stones.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.stone_id} ({s.carat_weight} ct)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Offered Price ({symbol} per carat)</Label>
                    <Input type="number" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Terms</Label>
                    <Input value={terms} onChange={e => setTerms(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Send Quotation</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Stone</TableHead>
                  <TableHead className="text-right">Price/ct</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No quotations yet.</TableCell></TableRow>
                ) : quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.buyer_name || `Buyer #${q.buyer}`}</TableCell>
                    <TableCell>{q.stone_id || `Stone #${q.stone}`}</TableCell>
                    <TableCell className="text-right">{symbol}{q.proposed_price}</TableCell>
                    <TableCell className="text-right">
                      {(isSales || isAdmin) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteQuotation(q.id)}
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

        <Card>
          <CardHeader>
            <CardTitle>Buyer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyers.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center">No buyers found.</TableCell></TableRow>
                ) : buyers.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.company_name}</TableCell>
                    <TableCell>{b.contact_person || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {(isOffice || isAdmin) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteBuyer(b.id)}
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
    </div>
  )
}
