import { useState } from "react"
import { Plus, Trash2, Receipt } from "lucide-react"
import { useData } from "../context/DataContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Dialog } from "../components/ui/dialog"
import { AccountForm } from "../components/forms/AccountForm"
import { InvoiceDialog } from "../components/InvoiceDialog"
import { formatCurrency } from "../lib/utils"
import type { Account } from "../types"
import { PM_IDS } from "../constants"

export function Accounts() {
    const { data, deleteData } = useData()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedAccountForInvoice, setSelectedAccountForInvoice] = useState<Account | null>(null)
    const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined)

    const accounts = data.filter(d => d.type === 'ACCOUNT') as Account[]

    const debitAccounts = accounts.filter(a => !a.accountType || a.accountType === 'DEBIT')
    const creditAccounts = accounts.filter(a => a.accountType === 'CREDIT')

    // Calculate balance per account (mock calculation based on transactions)
    const getBalance = (accountId: string) => {
        let total = 0
        // Add incomes
        total += data
            .filter(d => d.type === 'INCOME' && d.account === accountId)
            .reduce((acc, curr) => acc + (curr.value || 0), 0)
        // Subtract expenses
        // Debit: Only DEBIT or PIX
        total -= data
            .filter(d => {
                return d.type === 'EXPENSE' &&
                    d.account === accountId &&
                    (d.paymentMethod === PM_IDS.DEBIT || d.paymentMethod === PM_IDS.PIX)
            })
            .reduce((acc, curr) => acc + (curr.value || 0), 0)

        // Add initial balance if exists
        return total
    }

    const getInvoiceTotal = (accountId: string) => {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        return data
            .filter(d => {
                if (d.type !== 'EXPENSE') return false
                if (d.account !== accountId) return false

                // Credit: Only CREDIT or INVOICE
                if (d.paymentMethod !== PM_IDS.CREDIT && d.paymentMethod !== PM_IDS.INVOICE) return false

                if (!d.date) return false
                const tDate = new Date(d.date)
                return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth
            })
            .reduce((acc, curr) => acc + (curr.value || 0), 0)
    }

    const handleEdit = (account: Account) => {
        setEditingAccount(account)
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingAccount(undefined)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Conta
                </Button>
            </div>

            {/* Credit Accounts Section */}
            {creditAccounts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-muted-foreground">Cartões de Crédito</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {creditAccounts.map(account => (
                            <Card key={account.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleEdit(account)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {account.description}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 text-muted-foreground hover:text-red-500"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteData(account.id)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-500">
                                        {formatCurrency(getInvoiceTotal(account.id))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Fatura Atual</p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button
                                        variant="secondary"
                                        className="w-full text-xs h-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedAccountForInvoice(account)
                                        }}
                                    >
                                        <Receipt className="mr-2 h-3 w-3" />
                                        Ver Fatura
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Debit Accounts Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-muted-foreground">Contas / Débito</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {debitAccounts.map(account => (
                        <Card key={account.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleEdit(account)}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {account.description}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 text-muted-foreground hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteData(account.id)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getBalance(account.id) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatCurrency(getBalance(account.id))}
                                </div>
                                <p className="text-xs text-muted-foreground">Saldo atual</p>
                            </CardContent>
                        </Card>
                    ))}
                    {debitAccounts.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            Nenhuma conta de débito cadastrada.
                        </div>
                    )}
                </div>
            </div>

            <Dialog isOpen={isFormOpen} onClose={handleCloseForm} title={editingAccount ? "Editar Conta" : "Nova Conta"}>
                <AccountForm
                    onSuccess={handleCloseForm}
                    initialData={editingAccount}
                />
            </Dialog>

            <InvoiceDialog
                isOpen={!!selectedAccountForInvoice}
                onClose={() => setSelectedAccountForInvoice(null)}
                account={selectedAccountForInvoice}
            />
        </div>
    )
}
