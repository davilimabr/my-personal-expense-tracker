import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { useData } from "../context/DataContext"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Dialog } from "../components/ui/dialog"
import { IncomeForm } from "../components/forms/IncomeForm"
import { formatCurrency } from "../lib/utils"
import { MonthNavigator } from "../components/MonthNavigator"
import { isSameMonth } from "date-fns"

export function Incomes() {
    const { data, deleteData, currentDate } = useData()
    const [isOpen, setIsOpen] = useState(false)

    const incomes = useMemo(() => {
        return (data.filter(d => {
            if (d.type !== 'INCOME') return false
            if (!d.date) return false
            const [y, m, d_] = d.date.split('-').map(Number)
            return isSameMonth(new Date(y, m - 1, d_), currentDate)
        })).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    }, [data, currentDate])

    const getAccountName = (id?: string) => data.find(d => d.id === id)?.description || 'Sem Conta'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
                    <p className="text-muted-foreground">Gerencie suas entradas</p>
                </div>
                <div className="flex gap-2 items-center">
                    <MonthNavigator />
                    <Button onClick={() => setIsOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Receita
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {incomes.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                            <p>Nenhuma receita registrada.</p>
                        </CardContent>
                    </Card>
                ) : (
                    incomes.map(income => (
                        <Card key={income.id} className="overflow-hidden">
                            <div className="flex items-center p-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium leading-none">{income.description}</p>
                                        <span className="font-bold text-green-600">
                                            + {formatCurrency(income.value || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                        <span>{new Date(income.date || '').toLocaleDateString('pt-BR')}</span>
                                        <span>{getAccountName(income.account)}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-4 h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => deleteData(income.id)}
                                >
                                    <span className="sr-only">Delete</span>
                                    ×
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova Receita">
                <IncomeForm onSuccess={() => setIsOpen(false)} />
            </Dialog>
        </div>
    )
}
