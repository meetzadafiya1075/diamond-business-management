"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { coreApi } from "@/lib/api"

export default function RoughInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await coreApi.getParcelTracking()
      setInventory(Array.isArray(data) ? data : data.results || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (trackingId: number, newStatus: string) => {
    try {
      await coreApi.updateParcelTracking(trackingId, { status: newStatus })
      loadData()
    } catch (err) {
      console.error("Failed to update status", err)
      alert("Failed to update status. Only admins can change status manually.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rough Inventory</h1>
          <p className="text-muted-foreground mt-2">Live tracking and status management of all parcels.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Stock Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcel Name</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Update Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">No inventory items found.</TableCell></TableRow>
                ) : inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.parcel_name || `Parcel #${item.parcel}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'POLISHED' ? 'default' : 'secondary'}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Select 
                        value={item.status} 
                        onValueChange={(val: string | null) => handleStatusChange(item.id, val || item.status)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_INVENTORY">In Inventory</SelectItem>
                          <SelectItem value="IN_PLANNING">In Planning</SelectItem>
                          <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                          <SelectItem value="POLISHED">Polished (Ready)</SelectItem>
                          <SelectItem value="SOLD">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(item.last_updated).toLocaleString()}
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
