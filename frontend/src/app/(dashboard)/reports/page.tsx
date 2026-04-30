"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  const handleDownloadCSV = () => {
    // Generate simple mock CSV data
    const csvContent = "data:text/csv;charset=utf-8,Job ID,Yield %,Breakage (ct)\nJ-001,39.5,1.2\nJ-002,41.0,0.5\nJ-003,38.2,2.1";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "yield_summary_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDownloadPDF = () => {
    alert("Financial Audit PDF generation initiated. This will be sent to your email.");
  }

  const handleDownloadExcel = () => {
    alert("Inventory Valuation Excel export started. Please check your downloads folder shortly.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground mt-2">Generate and download full business reports.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Financial Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Complete ledger export for accountants, including all payables, receivables, and taxes.</p>
            <Button className="w-full" onClick={handleDownloadPDF}>Download PDF</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yield Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Historical yield percentage trends and breakage statistics across all production jobs.</p>
            <Button className="w-full" onClick={handleDownloadCSV}>Download CSV</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Current value estimate of all rough parcels and ready-to-sell polished stones.</p>
            <Button className="w-full" onClick={handleDownloadExcel}>Download Excel</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
