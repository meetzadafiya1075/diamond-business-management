"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductionPage() {
  const [jobs, setJobs] = useState([
    { id: "J-501", parcel: "P-1002", stage: "SAWING", worker: "Mike S.", status: "IN_PROGRESS", dueDate: "2026-05-02" },
    { id: "J-502", parcel: "P-1005", stage: "POLISHING", worker: "Anna K.", status: "PENDING", dueDate: "2026-05-05" },
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Board</h1>
          <p className="text-muted-foreground mt-2">Track jobs across marking, sawing, bruting, and polishing.</p>
        </div>
        <Button>+ Assign Job</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>{job.parcel}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.stage}</Badge>
                  </TableCell>
                  <TableCell>{job.worker}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Update Status</Button>
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
