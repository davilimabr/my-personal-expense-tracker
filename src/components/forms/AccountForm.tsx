import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { Account } from '../../types'
import { cn } from '../../lib/utils'

interface AccountFormProps {
    onSuccess: () => void
    initialData?: Account
}

export function AccountForm({ onSuccess, initialData }: AccountFormProps) {
    const { addData, updateData } = useData()
    const [name, setName] = useState('')
    const [accountType, setAccountType] = useState<'CREDIT' | 'DEBIT'>('DEBIT')

    useEffect(() => {
        if (initialData) {
            setName(initialData.description || '')
            setAccountType(initialData.accountType || 'DEBIT')
        }
    }, [initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (initialData) {
            updateData(initialData.id, {
                description: name,
                accountType
            } as any)
        } else {
            addData({
                type: 'ACCOUNT',
                description: name,
                accountType
            } as Account)
        }
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nome da conta (ex: Nubank)"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Tipo de Conta</Label>
                <select
                    id="type"
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as 'CREDIT' | 'DEBIT')}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                >
                    <option value="DEBIT">Conta / Débito</option>
                    <option value="CREDIT">Cartão de Crédito</option>
                </select>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit">{initialData ? 'Atualizar' : 'Salvar'}</Button>
            </div>
        </form>
    )
}
