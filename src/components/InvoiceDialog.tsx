import { useMemo } from "react"
import { useData } from "../context/DataContext"
import { Dialog } from "./ui/dialog"
import { formatCurrency } from "../lib/utils"
import type { Account } from "../types"

interface InvoiceDialogProps {
    isOpen: boolean
    onClose: () => void
    account: Account | null
}

export function InvoiceDialog({ isOpen, onClose, account }: InvoiceDialogProps) {
    const { data } = useData()

    const invoiceData = useMemo(() => {
        if (!account) return { total: 0, transactions: [] }

        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        const transactions = data
            .filter(d => {
                if (d.type !== 'EXPENSE') return false
                if (d.account !== account.id) return false

                // Check if date is in current month
                if (!d.date) return false // Should ideally use billing day logic, but relying on date for now
                const tDate = new Date(d.date)
                return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth
            })
            // Sort by date desc
            .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

        const total = transactions.reduce((acc, curr) => acc + (curr.value || 0), 0)

        return { total, transactions }
    }, [data, account, isOpen])

    if (!account) return null

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={`Fatura Atual - ${account.description}`}>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="font-medium">Total da Fatura</span>
                    <span className="text-xl font-bold text-red-500">{formatCurrency(invoiceData.total)}</span>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {invoiceData.transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">Nenhum lançamento nesta fatura.</p>
                    ) : (
                        invoiceData.transactions.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                <div className="space-y-1">
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '-'}
                                        {item.category && ` • ${item.category}`}
                                    </p>
                                </div>
                                <span className="font-medium text-red-500">
                                    {formatCurrency(item.value || 0)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Dialog>
    )
}
