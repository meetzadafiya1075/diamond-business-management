"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { coreApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency"

export default function PolishedInventoryPage() {
  const { symbol } = useCurrency()
  const [stones, setStones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadData = async () => {
    try {
      const data = await coreApi.getPolishedStones()
      setStones(data)
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polished Inventory</h1>
          <p className="text-muted-foreground mt-2">Ready-to-sell stock with 4C grading and certificates.</p>
        </div>
        <Button>Search Stones</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stone ID</TableHead>
                  <TableHead>Weight (ct)</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Clarity</TableHead>
                  <TableHead>Cut</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Est. Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stones.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center">No polished stones found.</TableCell></TableRow>
                ) : stones.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.stone_id}</TableCell>
                    <TableCell>{s.carat_weight}</TableCell>
                    <TableCell>{s.color_grade}</TableCell>
                    <TableCell>{s.clarity_grade}</TableCell>
                    <TableCell>{s.cut_grade}</TableCell>
                    <TableCell className="text-blue-500 underline cursor-pointer">{s.certification_number || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'READY' ? 'default' : 'secondary'}>
                        {s.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{symbol}{s.price_estimate || '0.00'}</TableCell>
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
