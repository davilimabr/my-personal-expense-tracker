import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useData } from "../context/DataContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Dialog } from "../components/ui/dialog"
import { SimpleForm } from "../components/forms/SimpleForm"
import { formatCurrency } from "../lib/utils"

export function Accounts() {
    const { data, deleteData } = useData()
    const [isOpen, setIsOpen] = useState(false)

    const accounts = data.filter(d => d.type === 'ACCOUNT')

    // Calculate balance per account (mock calculation based on transactions)
    const getBalance = (accountId: string) => {
        // Start with 0 or initial balance if we had it
        let total = 0
        // Add incomes
        total += data
            .filter(d => d.type === 'INCOME' && d.account === accountId)
            .reduce((acc, curr) => acc + (curr.value || 0), 0)
        // Subtract expenses
        total -= data
            .filter(d => d.type === 'EXPENSE' && d.account === accountId)
            .reduce((acc, curr) => acc + (curr.value || 0), 0)

        return total
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Conta
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map(account => (
                    <Card key={account.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {account.description}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 text-muted-foreground hover:text-red-500"
                                onClick={() => deleteData(account.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(getBalance(account.id))}</div>
                            <p className="text-xs text-muted-foreground">Saldo atual</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova Conta">
                <SimpleForm
                    type="ACCOUNT"
                    label="Nome da Conta"
                    onSuccess={() => setIsOpen(false)}
                />
            </Dialog>
        </div>
    )
}
