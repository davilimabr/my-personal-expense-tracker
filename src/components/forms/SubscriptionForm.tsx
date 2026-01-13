import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { Subscription } from '../../types'

interface SubscriptionFormProps {
    onSuccess: () => void
    initialData?: Subscription
}

export function SubscriptionForm({ onSuccess, initialData }: SubscriptionFormProps) {
    const { addData, updateData, data } = useData()
    const [formData, setFormData] = useState({
        description: '',
        value: '',
        billingDay: '',
        categoryId: '',
        accountId: '',
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description || '',
                value: initialData.value?.toString() || '',
                billingDay: initialData.billingDay?.toString() || '',
                categoryId: initialData.category || '',
                accountId: initialData.account || '',
            })
        }
    }, [initialData])

    const categories = data.filter(d => d.type === 'CATEGORY')
    const accounts = data.filter(d => d.type === 'ACCOUNT')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            description: formData.description,
            value: Number(formData.value),
            billingDay: Number(formData.billingDay),
            category: formData.categoryId,
            account: formData.accountId,
            active: true // Default to active
        }

        if (initialData) {
            updateData(initialData.id, payload)
        } else {
            addData({
                type: 'SUBSCRIPTION',
                ...payload
            })
        }
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="description">Nome da Assinatura</Label>
                <Input
                    id="description"
                    placeholder="Ex: Netflix, Spotify"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="value">Valor Mensal</Label>
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
                <div className="space-y-2">
                    <Label htmlFor="billingDay">Dia da Cobrança</Label>
                    <Input
                        id="billingDay"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Dia (1-31)"
                        value={formData.billingDay}
                        onChange={e => setFormData({ ...formData, billingDay: e.target.value })}
                        required
                    />
                </div>
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
                    <Label htmlFor="account">Conta (Opcional)</Label>
                    <select
                        id="account"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.accountId}
                        onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                    >
                        <option value="">Selecione...</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.description}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit">{initialData ? 'Atualizar' : 'Salvar'}</Button>
            </div>
        </form>
    )
}
