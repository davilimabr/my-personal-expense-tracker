import { useData } from "../context/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { formatCurrency } from "../lib/utils"
import { isSameMonth } from "date-fns"
import { MonthNavigator } from "../components/MonthNavigator"

export function Budget() {
    const { data, addData, updateData, currentDate } = useData()

    const categories = data.filter(d => d.type === 'CATEGORY')
    const budgets = data.filter(d => d.type === 'BUDGET_DISTRIBUTION')

    // Calculate Monthly Income
    const monthlyIncome = data
        .filter(d => {
            if (d.type !== 'INCOME') return false
            if (!d.date) return false
            const [y, m, d_] = d.date.split('-').map(Number)
            return isSameMonth(new Date(y, m - 1, d_), currentDate)
        })
        .reduce((acc, curr) => acc + (curr.value || 0), 0)

    // Calculate Total Budgeted
    const totalBudget = categories.reduce((acc, category) => {
        const budget = budgets.find(b => b.category === category.id)
        return acc + (budget?.value || 0)
    }, 0)

    const totalBudgetPercentage = monthlyIncome > 0 ? (totalBudget / monthlyIncome) * 100 : 0

    const getBudget = (categoryId: string) => {
        return budgets.find(b => b.category === categoryId)
    }

    const handleBudgetChange = (categoryId: string, value: string) => {
        const numValue = Number(value)
        const existing = getBudget(categoryId)

        if (existing) {
            updateData(existing.id, { value: numValue })
        } else {
            addData({
                type: 'BUDGET_DISTRIBUTION',
                category: categoryId,
                value: numValue
            })
        }
    }

    // Calculate actual spending
    const getActual = (categoryId: string) => {
        return data
            .filter(d => {
                if (d.type !== 'EXPENSE') return false
                if (d.category !== categoryId) return false
                if (!d.date) return false
                const [y, m, d_] = d.date.split('-').map(Number)
                return isSameMonth(new Date(y, m - 1, d_), currentDate)
            })
            .reduce((acc, curr) => acc + (curr.value || 0), 0)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Distribuição de Orçamento</h2>
                <MonthNavigator />
            </div>

            {/* Summary Card */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Orçado</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">% Comprometida</p>
                            <p className={`text-2xl font-bold ${totalBudgetPercentage > 100 ? 'text-red-500' : 'text-blue-600'}`}>
                                {totalBudgetPercentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {categories.map(category => {
                    const budget = getBudget(category.id)?.value || 0
                    const actual = getActual(category.id)
                    const percentage = budget > 0 ? (actual / budget) * 100 : 0
                    const incomePercentage = monthlyIncome > 0 ? (budget / monthlyIncome) * 100 : 0

                    return (
                        <Card key={category.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {category.description}
                                </CardTitle>
                                <div className="text-sm text-right">
                                    <div className="font-bold">
                                        {formatCurrency(actual)} / <span className="text-muted-foreground">{formatCurrency(budget)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Representa {incomePercentage.toFixed(1)}% da receita
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${percentage > 100 ? 'bg-red-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% utilizado do orçamento</p>
                                    </div>
                                    <div className="w-32">
                                        <Input
                                            type="number"
                                            placeholder="Orçamento"
                                            value={getBudget(category.id)?.value?.toString() || ''}
                                            onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
