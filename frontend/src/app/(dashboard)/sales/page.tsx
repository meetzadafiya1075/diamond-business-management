"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { businessApi } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function SalesCRMPage() {
  const [buyers, setBuyers] = useState<any[]>([])
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const [buyerData, quoteData] = await Promise.all([
        businessApi.getBuyers(),
        businessApi.getQuotations()
      ])
      setBuyers(buyerData)
      setQuotations(quoteData)
    } catch (err: any) {
      if (err.message.includes('Authentication') || err.message.includes('credential')) {
        router.push('/login')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales CRM</h1>
          <p className="text-muted-foreground mt-2">Manage buyers, inquiries, and polished quotations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">+ Add Buyer</Button>
          <Button>+ New Quotation</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Stone</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No quotations found.</TableCell></TableRow>
                  ) : quotations.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.buyer_name}</TableCell>
                      <TableCell>{q.stone_id}</TableCell>
                      <TableCell>${q.proposed_price}</TableCell>
                      <TableCell>
                        <Badge variant={q.status === 'ACCEPTED' ? 'default' : q.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {q.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buyer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>KYC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center">No buyers found.</TableCell></TableRow>
                  ) : buyers.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.company_name}</TableCell>
                      <TableCell>{b.contact_person || 'N/A'}</TableCell>
                      <TableCell>
                        {b.kyc_verified ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>
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
    </div>
  )
}
