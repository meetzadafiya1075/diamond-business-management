"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PlanningPage() {
  const [plans, setPlans] = useState<any[]>([])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning Board</h1>
          <p className="text-muted-foreground mt-2">Assign rough parcels and calculate expected yield.</p>
        </div>
        <Button>+ Assign Planning</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Planning Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead className="text-right">Weight (ct)</TableHead>
                <TableHead>Planner</TableHead>
                <TableHead className="text-right">Expected Yield</TableHead>
                <TableHead className="text-right">Polished (ct)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell className="text-right">{p.weight}</TableCell>
                  <TableCell>{p.planner}</TableCell>
                  <TableCell className="text-right">{p.expectedYield}</TableCell>
                  <TableCell className="text-right">{p.polishedCt}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit Plan</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
