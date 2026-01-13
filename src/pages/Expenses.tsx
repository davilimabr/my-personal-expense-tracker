
import { useState, useMemo } from "react"
import { Plus, Tag, Pencil, Trash2, Sparkles } from "lucide-react"
import { useData } from "../context/DataContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Dialog } from "../components/ui/dialog"
import { ExpenseForm } from "../components/forms/ExpenseForm"
import { EntityList } from "../components/EntityList"
import { formatCurrency } from "../lib/utils"
import type { Expense, Subscription } from "../types"
import { MonthNavigator } from "../components/MonthNavigator"
import { isSameMonth } from "date-fns"
import { SubscriptionForm } from "../components/forms/SubscriptionForm"

export function Expenses() {
    const { data, deleteData, currentDate } = useData()
    const [isExpenseOpen, setIsExpenseOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)

    const [isCategoryOpen, setIsCategoryOpen] = useState(false)

    // Subscriptions
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false)
    const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>(undefined)

    // Filter by type AND month
    const expenses = useMemo(() => {
        return (data.filter(d => {
            if (d.type !== 'EXPENSE') return false
            if (!d.date) return false
            const [y, m, d_] = d.date.split('-').map(Number)
            return isSameMonth(new Date(y, m - 1, d_), currentDate)
        }) as Expense[]).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    }, [data, currentDate])

    // Subscriptions List
    const subscriptions = useMemo(() => {
        return (data.filter(d => d.type === 'SUBSCRIPTION') as Subscription[])
            .sort((a, b) => (a.billingDay || 0) - (b.billingDay || 0))
    }, [data])

    const getCategoryName = (id?: string) => data.find(d => d.id === id)?.description || 'Sem Categoria'
    const getAccountName = (id?: string) => data.find(d => d.id === id)?.description || 'Sem Conta'

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense)
        setIsExpenseOpen(true)
    }

    const handleCloseExpense = () => {
        setIsExpenseOpen(false)
        setEditingExpense(undefined)
    }

    const handleEditSubscription = (sub: Subscription) => {
        setEditingSubscription(sub)
        setIsSubscriptionOpen(true)
    }

    const handleCloseSubscription = () => {
        setIsSubscriptionOpen(false)
        setEditingSubscription(undefined)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
                    <p className="text-muted-foreground">Gerencie suas despesas e assinaturas</p>
                </div>
                <div className="flex gap-2 items-center">
                    <MonthNavigator />
                    <div className="h-4 w-px bg-border mx-2" />
                    <Button variant="outline" onClick={() => setIsCategoryOpen(true)}>
                        <Tag className="mr-2 h-4 w-4" />
                        Categorias
                    </Button>
                    <Button onClick={() => setIsExpenseOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Gasto
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Expenses List */}
                <div className="lg:col-span-2 space-y-4">
                    {expenses.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                <p>Nenhuma despesa registrada neste mês.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        expenses.map(expense => (
                            <Card key={expense.id} className="overflow-hidden">
                                <div className="flex items-center p-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium leading-none">{expense.description}</p>
                                            <span className="font-bold text-red-600">
                                                - {formatCurrency(expense.value || 0)}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                                            <span>{new Date(expense.date || '').toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {getCategoryName(expense.category)}
                                            </span>
                                            <span>{getAccountName(expense.account)}</span>
                                        </div>
                                        {expense.relatedId && (
                                            <p className="text-xs text-blue-500 italic mt-1">
                                                <Sparkles className="inline w-3 h-3 mr-1" />
                                                Assinatura Automática
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center ml-4 gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleEdit(expense)}
                                        >
                                            <Pencil className="h-4 w-4 text-secondary-foreground/60" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100/10"
                                            onClick={() => deleteData(expense.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Sidebar: Subscriptions */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                Assinaturas
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSubscriptionOpen(true)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {subscriptions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Nenhuma assinatura recorrente.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {subscriptions.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{sub.description}</p>
                                                <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                    <span>Dia {sub.billingDay}</span>
                                                    <span>•</span>
                                                    <span>{formatCurrency(sub.value || 0)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditSubscription(sub)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => deleteData(sub.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Existing Dialogs */}
            <Dialog isOpen={isExpenseOpen} onClose={handleCloseExpense} title={editingExpense ? "Editar Despesa" : "Nova Despesa"}>
                <ExpenseForm onSuccess={handleCloseExpense} initialData={editingExpense} />
            </Dialog>

            <Dialog isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} title="Gerenciar Categorias">
                <EntityList type="CATEGORY" title="Categoria" onClose={() => setIsCategoryOpen(false)} />
            </Dialog>

            {/* Subscription Dialog */}
            <Dialog isOpen={isSubscriptionOpen} onClose={handleCloseSubscription} title={editingSubscription ? "Editar Assinatura" : "Nova Assinatura"}>
                <SubscriptionForm onSuccess={handleCloseSubscription} initialData={editingSubscription} />
            </Dialog>
        </div>
    )
}
