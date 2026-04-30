"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { businessApi } from "@/lib/api"
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
import { Trash2, Plus, DollarSign, Wallet } from "lucide-react"

export default function AccountsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog States
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)

  // Transaction Form State
  const [txType, setTxType] = useState("PAYABLE")
  const [partyName, setPartyName] = useState("")
  const [txAmount, setTxAmount] = useState("")
  const [dueDate, setDueDate] = useState("")

  // Expense Form State
  const [category, setCategory] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [txData, expenseData] = await Promise.all([
        businessApi.getTransactions(),
        businessApi.getExpenses()
      ])
      setTransactions(Array.isArray(txData) ? txData : txData.results || [])
      setExpenses(Array.isArray(expenseData) ? expenseData : expenseData.results || [])
    } catch (err) {
      console.error("Failed to load accounts data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await businessApi.createTransaction({
        transaction_type: txType,
        party_name: partyName,
        amount: txAmount,
        due_date: dueDate,
        status: 'OUTSTANDING'
      })
      setIsTxDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to create transaction: ${err.message}`)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await businessApi.createExpense({
        category,
        amount: expenseAmount,
        date: expenseDate
      })
      setIsExpenseDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to log expense: ${err.message}`)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await businessApi.deleteTransaction(id)
      loadData()
    } catch (err) { console.error(err) }
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await businessApi.deleteExpense(id)
      loadData()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts & Finance</h1>
          <p className="text-muted-foreground mt-2">Manage transactions, expenses, and financial health.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger>
              <div className="bg-outline text-outline-foreground border border-input hover:bg-accent h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                <Wallet className="mr-2 h-4 w-4" /> Log Expense
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Business Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Electricity, Rent" required />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Expense</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTxDialogOpen} onOpenChange={setIsTxDialogOpen}>
            <DialogTrigger>
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                <DollarSign className="mr-2 h-4 w-4" /> New Transaction
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={txType} onValueChange={setTxType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYABLE">Payable (You Owe)</SelectItem>
                      <SelectItem value="RECEIVABLE">Receivable (Customer Owes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Party Name</Label>
                  <Input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="Supplier or Buyer name" required />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                </div>
                <DialogFooter>
                  <Button type="submit">Record Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No transactions.</TableCell></TableRow>
                ) : transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{t.party_name}</span>
                        <span className="text-xs text-muted-foreground">{t.transaction_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className={t.transaction_type === 'RECEIVABLE' ? 'text-green-600' : 'text-red-600'}>
                      ${t.amount}
                    </TableCell>
                    <TableCell>{t.due_date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteTransaction(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No expenses.</TableCell></TableRow>
                ) : expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.category}</TableCell>
                    <TableCell>${e.amount}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteExpense(e.id)}>
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
    </div>
  )
}
