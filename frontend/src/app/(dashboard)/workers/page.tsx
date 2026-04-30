"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function WorkerManagementPage() {
  const [workers, setWorkers] = useState([
    { id: "W-01", name: "Mike S.", skills: "Sawing, Lasering", activeTask: "J-501 (Sawing)", efficiency: "98.5%" },
    { id: "W-02", name: "Anna K.", skills: "Polishing", activeTask: "J-502 (Polishing)", efficiency: "102.0%" },
    { id: "W-03", name: "Raj P.", skills: "Marking", activeTask: "None", efficiency: "95.0%" },
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
          <p className="text-muted-foreground mt-2">Track worker skills, assignments, and efficiency.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factory Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Active Task</TableHead>
                <TableHead className="text-right">Efficiency Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">{worker.id}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.skills}</TableCell>
                  <TableCell>
                    {worker.activeTask !== "None" ? (
                      <Badge variant="outline">{worker.activeTask}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Idle</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {worker.efficiency}
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
