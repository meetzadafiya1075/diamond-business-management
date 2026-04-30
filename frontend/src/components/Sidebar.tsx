import Link from 'next/link'
import { 
  Home, 
  ShoppingCart, 
  Package, 
  LineChart, 
  Wrench, 
  Users, 
  PieChart, 
  Diamond, 
  Briefcase, 
  CreditCard, 
  BarChart, 
  FileText, 
  Settings 
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Rough Purchase', href: '/purchase', icon: ShoppingCart },
  { name: 'Rough Inventory', href: '/inventory/rough', icon: Package },
  { name: 'Planning', href: '/planning', icon: LineChart },
  { name: 'Production Board', href: '/production', icon: Wrench },
  { name: 'Worker Mgmt', href: '/workers', icon: Users },
  { name: 'Yield & Loss', href: '/yield', icon: PieChart },
  { name: 'Polished Inventory', href: '/inventory/polished', icon: Diamond },
  { name: 'Sales CRM', href: '/sales', icon: Briefcase },
  { name: 'Accounts', href: '/accounts', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Diamond className="h-6 w-6 text-primary" />
          <span className="">Diamond ERP</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
