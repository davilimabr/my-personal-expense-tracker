import { useState } from "react"
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react"
import { useData } from "../context/DataContext"
import { Button } from "./ui/button"
import { SimpleForm } from "./forms/SimpleForm"
import type { AppData, TransactionType } from "../types"

interface EntityListProps {
    type: TransactionType
    title: string
    onClose: () => void
}

export function EntityList({ type, title }: EntityListProps) {
    const { data, deleteData } = useData()
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST')
    const [editingItem, setEditingItem] = useState<AppData | undefined>(undefined)

    // Filter items by type
    const items = data.filter(d => d.type === type)
    // Sort by description
    items.sort((a, b) => (a.description || '').localeCompare(b.description || ''))

    const handleEdit = (item: AppData) => {
        setEditingItem(item)
        setView('FORM')
    }

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            deleteData(id)
        }
    }

    const handleFormSuccess = () => {
        setView('LIST')
        setEditingItem(undefined)
    }

    if (view === 'FORM') {
        return (
            <div className="space-y-4">
                <Button variant="ghost" className="pl-0 gap-2" onClick={() => setView('LIST')}>
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
                <SimpleForm
                    type={type}
                    label={title}
                    onSuccess={handleFormSuccess}
                    initialData={editingItem}
                />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{items.length} itens cadastrados</p>
                <Button size="sm" onClick={() => { setEditingItem(undefined); setView('FORM') }}>
                    <Plus className="mr-2 h-4 w-4" /> Novo
                </Button>
            </div>

            <div className="border rounded-md divide-y divide-border max-h-[300px] overflow-y-auto">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        Nenhum item encontrado.
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                            <span className="font-medium">{item.description}</span>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
