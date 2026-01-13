import { useData } from "../context/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { formatCurrency } from "../lib/utils"

export function Budget() {
    const { data, addData, updateData } = useData()

    const categories = data.filter(d => d.type === 'CATEGORY')
    const budgets = data.filter(d => d.type === 'BUDGET_DISTRIBUTION')

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
            .filter(d => d.type === 'EXPENSE' && d.category === categoryId)
            .reduce((acc, curr) => acc + (curr.value || 0), 0)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Distribuição de Orçamento</h2>

            <div className="grid gap-6">
                {categories.map(category => {
                    const budget = getBudget(category.id)?.value || 0
                    const actual = getActual(category.id)
                    const percentage = budget > 0 ? (actual / budget) * 100 : 0

                    return (
                        <Card key={category.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {category.description}
                                </CardTitle>
                                <div className="font-bold text-sm">
                                    {formatCurrency(actual)} / <span className="text-muted-foreground">{formatCurrency(budget)}</span>
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
                                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% utilizado</p>
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
