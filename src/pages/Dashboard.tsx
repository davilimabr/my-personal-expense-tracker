import { useMemo } from "react"
import { useData } from "../context/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { formatCurrency } from "../lib/utils"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { Activity, Wallet, TrendingUp } from "lucide-react"
import { MonthNavigator } from "../components/MonthNavigator"
import { isSameMonth } from "date-fns"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function Dashboard() {
    const { data, currentDate } = useData()

    const filteredData = useMemo(() => {
        return data.filter(item => {
            if (!item.date) return false
            const [y, m, d] = item.date.split('-').map(Number)
            const itemDate = new Date(y, m - 1, d)
            return isSameMonth(itemDate, currentDate)
        })
    }, [data, currentDate])

    const expenses = filteredData.filter(d => d.type === 'EXPENSE')
    const incomes = filteredData.filter(d => d.type === 'INCOME')

    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.value || 0), 0)
    const totalIncome = incomes.reduce((acc, curr) => acc + (curr.value || 0), 0)
    const balance = totalIncome - totalExpenses

    // Data for Charts

    // 1. Expenses by Category
    const categoryData = data
        .filter(d => d.type === 'CATEGORY')
        .map(cat => {
            const value = expenses
                .filter(e => e.category === cat.id)
                .reduce((acc, curr) => acc + (curr.value || 0), 0)
            return { name: cat.description, value }
        })
        .filter(item => item.value > 0)

    // 2. Timeline (Last 30 days or all)
    // Group by date
    // Note: timeline might be better showing "Current Month Daily"
    const timelineMap = new Map<string, number>()
    expenses.forEach(e => {
        const date = e.date || 'Unknown'
        timelineMap.set(date, (timelineMap.get(date) || 0) + (e.value || 0))
    })

    const timelineData = Array.from(timelineMap.entries())
        .map(([date, value]) => ({ date: new Date(date).toLocaleDateString('pt-BR'), value }))
        // Sort by date (parsing date string back to timestamp for sorting)
        .sort((a, b) => {
            const [d1, m1, y1] = a.date.split('/')
            const [d2, m2, y2] = b.date.split('/')
            return new Date(Number(y1), Number(m1) - 1, Number(d1)).getTime() - new Date(Number(y2), Number(m2) - 1, Number(d2)).getTime()
        })
    // .slice(-14) // No slicing, show all for the month

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Visão geral das suas finanças</p>
                </div>
                <MonthNavigator />
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(balance)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Gastos por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }: { name: string, percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Evolução dos Gastos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
