import { Sidebar } from "@/components/Sidebar"
import { HeaderAuth } from "@/components/HeaderAuth"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">Diamond ERP</h1>
          </div>
          <HeaderAuth />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
