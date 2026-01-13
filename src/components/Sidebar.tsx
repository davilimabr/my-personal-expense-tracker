import { LayoutDashboard, Wallet, TrendingUp, CreditCard, PieChart, ScrollText } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"

const items = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Gastos", href: "/expenses", icon: Wallet },
    { name: "Receitas", href: "/incomes", icon: TrendingUp },
    { name: "Contas", href: "/accounts", icon: CreditCard },
    { name: "Orçamento", href: "/budget", icon: PieChart },
    { name: "Prestação de Contas", href: "/ledger", icon: ScrollText },
    // { name: "Configurações", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="flex h-screen w-64 flex-col bg-card border-r border-border text-card-foreground">
            <div className="flex h-16 items-center px-6 border-b border-border gap-3">
                <img src="/app-icon.png" alt="Logo" className="h-8 w-8 object-contain" />
                <h1 className="text-xl font-bold text-primary">Finanças</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {items.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground">v0.1.0 Beta</p>
            </div>
        </div>
    )
}
