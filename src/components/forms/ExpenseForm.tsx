import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { DatePicker } from '../ui/date-picker'
import type { Expense } from '../../types'

interface ExpenseFormProps {
    onSuccess: () => void
    initialData?: Expense
}

export function ExpenseForm({ onSuccess, initialData }: ExpenseFormProps) {
    const { addData, updateData, data } = useData()
    // manage date separately to handle Date object for picker
    const [date, setDate] = useState<Date | undefined>(new Date())

    const [formData, setFormData] = useState({
        description: '',
        value: '',
        categoryId: '',
        accountId: '',
        paymentMethodId: '',
        notes: ''
    })

    useEffect(() => {
        if (initialData) {
            // handle timezone offset issues by splitting strictly
            const [y, m, d] = (initialData.date || '').split('-').map(Number)
            // Create date object at noon to avoid timezone shifts
            const initialDate = initialData.date ? new Date(y, m - 1, d, 12) : new Date()

            setDate(initialDate)
            setFormData({
                description: initialData.description || '',
                value: initialData.value?.toString() || '',
                categoryId: initialData.category || '',
                accountId: initialData.account || '',
                paymentMethodId: initialData.paymentMethod || '',
                notes: initialData.notes || ''
            })
        }
    }, [initialData])

    // Derive lists
    const categories = data.filter(d => d.type === 'CATEGORY')
    const accounts = data.filter(d => d.type === 'ACCOUNT')
    const paymentMethods = data.filter(d => d.type === 'PAYMENT_METHOD')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Format date as YYYY-MM-DD
        const formattedDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

        const payload = {
            date: formattedDate,
            description: formData.description,
            value: Number(formData.value),
            category: formData.categoryId,
            account: formData.accountId,
            paymentMethod: formData.paymentMethodId,
            notes: formData.notes
        }

        if (initialData) {
            updateData(initialData.id, payload)
        } else {
            addData({
                type: 'EXPENSE',
                ...payload
            })
        }
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="date">Data</Label>
                    <DatePicker
                        id="date"
                        date={date}
                        setDate={setDate}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input
                        id="value"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.value}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                    id="description"
                    placeholder="Ex: Supermercado"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                    >
                        <option value="">Selecione...</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.description}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account">Conta</Label>
                    <select
                        id="account"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.accountId}
                        onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                        required
                    >
                        <option value="">Selecione...</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.description}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="payment">Forma de Pagamento</Label>
                <select
                    id="payment"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.paymentMethodId}
                    onChange={e => setFormData({ ...formData, paymentMethodId: e.target.value })}
                >
                    <option value="">Selecione (Opcional)...</option>
                    {paymentMethods.map(p => (
                        <option key={p.id} value={p.id}>{p.description}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Obs</Label>
                <Input
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <Button type="submit">{initialData ? 'Atualizar' : 'Salvar'}</Button>
            </div>
        </form>
    )
}
