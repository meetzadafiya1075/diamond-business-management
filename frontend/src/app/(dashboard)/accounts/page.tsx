"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { businessApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency"

export default function AccountsPage() {
  const { symbol } = useCurrency()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const data = await businessApi.getTransactions()
      setTransactions(data)
    } catch (err: any) {
      if (err.message.includes('Authentication') || err.message.includes('credential')) {
        router.push('/login')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const payables = transactions.filter(t => t.transaction_type === 'PAYABLE' && t.status === 'OUTSTANDING').reduce((acc, t) => acc + parseFloat(t.amount), 0)
  const receivables = transactions.filter(t => t.transaction_type === 'RECEIVABLE' && t.status === 'OUTSTANDING').reduce((acc, t) => acc + parseFloat(t.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts & Finance</h1>
          <p className="text-muted-foreground mt-2">Track payables, receivables, and ledgers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">+ Log Expense</Button>
          <Button>+ New Transaction</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{symbol}{payables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding rough purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{symbol}{receivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding polished sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${receivables - payables >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {symbol}{(receivables - payables).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">No transactions found.</TableCell></TableRow>
                ) : transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.due_date}</TableCell>
                    <TableCell className="font-medium">{t.party_name}</TableCell>
                    <TableCell>
                      <Badge variant={t.transaction_type === 'RECEIVABLE' ? 'default' : 'destructive'}>
                        {t.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{symbol}{t.amount}</TableCell>
                    <TableCell>
                      {t.status === 'CLEARED' ? (
                        <span className="text-green-600 font-semibold">Cleared</span>
                      ) : (
                        <span className="text-orange-500 font-semibold">Outstanding</span>
                      )}
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
