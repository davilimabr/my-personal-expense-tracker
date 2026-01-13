import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { SalaryConfig } from '../../types'

interface SalaryFormProps {
    onSuccess: () => void
}

export function SalaryForm({ onSuccess }: SalaryFormProps) {
    const { addData, updateData, data } = useData()
    const [amount, setAmount] = useState('')
    const [accountId, setAccountId] = useState('')
    const [isActive, setIsActive] = useState(true)

    // Find existing config
    const existingConfig = data.find(d => d.type === 'SALARY_CONFIG') as SalaryConfig | undefined

    useEffect(() => {
        if (existingConfig) {
            setAmount(existingConfig.value?.toString() || '')
            setAccountId(existingConfig.account || '')
            setIsActive(existingConfig.active !== false)
        }
    }, [existingConfig])

    const accounts = data.filter(d => d.type === 'ACCOUNT' && (d as any).accountType === 'DEBIT')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            description: 'Salário',
            value: Number(amount),
            account: accountId,
            active: isActive
        }

        if (existingConfig) {
            updateData(existingConfig.id, payload)
        } else {
            addData({
                type: 'SALARY_CONFIG',
                ...payload
            } as any)
        }
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Valor do Salário</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="account">Conta de Destino</Label>
                <select
                    id="account"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    required
                >
                    <option value="">Selecione...</option>
                    {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.description}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                />
                <Label htmlFor="active">Ativar Geração Automática (Último dia útil)</Label>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit">Salvar Configuração</Button>
            </div>
        </form>
    )
}
