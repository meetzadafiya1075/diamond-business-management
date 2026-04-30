"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { businessApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { AlertCircle, TrendingUp, DollarSign, Gem, Activity } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

export default function ExecutiveDashboard() {
  const { symbol } = useCurrency()
  const [analytics, setAnalytics] = useState<any>({
    net_position: 0,
    average_yield: 0,
    polished_inventory_value: 0
  })
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const [analyticsData, alertsData] = await Promise.all([
        businessApi.getAnalytics(),
        businessApi.getAlerts()
      ])
      setAnalytics(analyticsData)
      setAlerts(alertsData.alerts || [])
    } catch (err: any) {
      if (err.message && (err.message.includes('Authentication') || err.message.includes('credential'))) {
        router.push('/login')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground mt-2">Real-time overview of factory operations and financial health.</p>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-900 text-slate-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Financial Position</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.net_position >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {symbol}{analytics.net_position.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 mt-1">Receivables minus Payables</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Factory Yield</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.average_yield}%</div>
                <p className="text-xs text-muted-foreground mt-1">Across all completed jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready Stock Value</CardTitle>
                <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{symbol}{analytics.polished_inventory_value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Estimated polished inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{alerts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-md border border-red-100">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant="destructive">{alert.severity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
