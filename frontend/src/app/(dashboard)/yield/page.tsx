"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { coreApi } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function YieldPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadData = async () => {
    try {
      const data = await coreApi.getYieldReports()
      setReports(data)
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
          <h1 className="text-3xl font-bold tracking-tight">Yield & Loss Report</h1>
          <p className="text-muted-foreground mt-2">Factory performance and stage-wise loss tracking.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Waiting for production data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Breakage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">0 ct</div>
            <p className="text-xs text-muted-foreground">No active jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Polished Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0 ct</div>
            <p className="text-xs text-muted-foreground">No output recorded</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Yield Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Parcel ID</TableHead>
                  <TableHead className="text-right">Polished (ct)</TableHead>
                  <TableHead className="text-right">Breakage (ct)</TableHead>
                  <TableHead className="text-right">Wastage (ct)</TableHead>
                  <TableHead className="text-right">Actual Yield</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No yield reports found.</TableCell></TableRow>
                ) : reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">YR-{r.id}</TableCell>
                    <TableCell>{r.parcel_name}</TableCell>
                    <TableCell className="text-right">{r.final_polished_carats}</TableCell>
                    <TableCell className="text-right text-red-500">{r.breakage_carats}</TableCell>
                    <TableCell className="text-right text-orange-500">{r.wastage_carats}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{r.yield_percentage}%</TableCell>
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
