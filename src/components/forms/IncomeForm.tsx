import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface IncomeFormProps {
    onSuccess: () => void
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
    const { addData, data } = useData()
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        value: '',
        accountId: '',
        notes: ''
    })

    // Derive lists
    const accounts = data.filter(d => d.type === 'ACCOUNT')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addData({
            type: 'INCOME',
            date: formData.date,
            description: formData.description,
            value: Number(formData.value),
            account: formData.accountId,
            notes: formData.notes
        })
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
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
                    placeholder="Ex: Salário"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="account">Conta de Entrada</Label>
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

            <div className="space-y-2">
                <Label htmlFor="notes">Obs</Label>
                <Input
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    )
}
