import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { TransactionType, AppData } from '../../types'

interface SimpleFormProps {
    type: TransactionType
    label: string
    onSuccess: () => void
    initialData?: AppData
}

export function SimpleForm({ type, label, onSuccess, initialData }: SimpleFormProps) {
    const { addData, updateData } = useData()
    const [name, setName] = useState('')

    useEffect(() => {
        if (initialData) {
            setName(initialData.description || '')
        }
    }, [initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (initialData) {
            updateData(initialData.id, { description: name })
        } else {
            addData({
                type,
                description: name
            })
        }
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">{label}</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={`Nome da ${label.toLowerCase()}`}
                    required
                />
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit">{initialData ? 'Atualizar' : 'Salvar'}</Button>
            </div>
        </form>
    )
}
