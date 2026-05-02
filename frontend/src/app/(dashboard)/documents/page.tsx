"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { businessApi, API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { isOffice } = useUser()

  // Form state
  const [title, setTitle] = useState("")
  const [type, setType] = useState("INVOICE")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const data = await businessApi.getDocuments()
      setDocuments(data)
    } catch (err: any) {
      if (err.message.includes('Authentication') || err.message.includes('credential')) {
        router.push('/login')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    try {
      await businessApi.deleteDocument(id)
      loadData()
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('document_type', type)
    formData.append('file', file)

    try {
      await businessApi.createDocument(formData)
      setIsDialogOpen(false)
      setTitle("")
      setFile(null)
      loadData()
    } catch (err) {
      console.error("Upload failed", err)
      alert("Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = (fileUrl: string) => {
    if (!fileUrl) return
    // Ensure the URL is absolute by prepending the backend base URL if needed
    const absoluteUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${API_BASE_URL.replace('/api', '')}${fileUrl}`
    window.open(absoluteUrl, '_blank')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
          <p className="text-muted-foreground mt-2">Centralized storage for invoices, certificates, and KYC.</p>
        </div>
        
        {isOffice && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer">
                + Upload Document
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Rough Purchase Invoice #102" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Category</Label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="KYC">KYC Document</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Start Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No documents found.</TableCell></TableRow>
                ) : documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell 
                      className="font-medium text-blue-600 underline cursor-pointer"
                      onClick={() => handleDownload(doc.file)}
                    >
                      {doc.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.document_type}</Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(doc.file)}
                      >
                        Download
                      </Button>
                      {isOffice && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
