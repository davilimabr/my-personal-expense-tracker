import { useState } from "react"
import { useData } from "../context/DataContext"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Dialog } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { formatCurrency } from "../lib/utils"
import { CheckCircle2, Circle, Trash2 } from "lucide-react"
import { DatePicker } from "../components/ui/date-picker"

export function Ledger() {
    const { data, updateData, deleteData } = useData()
    const [isPayableOpen, setIsPayableOpen] = useState(false)
    const [isReceivableOpen, setIsReceivableOpen] = useState(false)

    const payables = data.filter(d => d.type === 'PAYABLE').sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    const receivables = data.filter(d => d.type === 'RECEIVABLE').sort((a, b) => (a.date || '').localeCompare(b.date || ''))

    const toggleStatus = (id: string, current: string | undefined) => {
        updateData(id, { status: current === 'PAID' ? 'PENDING' : 'PAID' })
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Prestação de Contas</h2>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Payables */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-red-600">A Pagar</h3>
                        <Button size="sm" variant="outline" onClick={() => setIsPayableOpen(true)}>Novo</Button>
                    </div>
                    {payables.map(item => (
                        <Card key={item.id} className={item.status === 'PAID' ? 'opacity-60' : ''}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <button onClick={() => toggleStatus(item.id, item.status)}>
                                    {item.status === 'PAID'
                                        ? <CheckCircle2 className="text-green-500 h-6 w-6" />
                                        : <Circle className="text-gray-300 h-6 w-6" />
                                    }
                                </button>
                                <div className="flex-1">
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(item.date || '').toLocaleDateString('pt-BR')} - {formatCurrency(item.value || 0)}</p>
                                    {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteData(item.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Receivables */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-green-600">A Receber</h3>
                        <Button size="sm" variant="outline" onClick={() => setIsReceivableOpen(true)}>Novo</Button>
                    </div>
                    {receivables.map(item => (
                        <Card key={item.id} className={item.status === 'PAID' ? 'opacity-60' : ''}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <button onClick={() => toggleStatus(item.id, item.status)}>
                                    {item.status === 'PAID'
                                        ? <CheckCircle2 className="text-green-500 h-6 w-6" />
                                        : <Circle className="text-gray-300 h-6 w-6" />
                                    }
                                </button>
                                <div className="flex-1">
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(item.date || '').toLocaleDateString('pt-BR')} - {formatCurrency(item.value || 0)}</p>
                                    {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteData(item.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog isOpen={isPayableOpen} onClose={() => setIsPayableOpen(false)} title="Conta a Pagar">
                <LedgerForm type="PAYABLE" onSuccess={() => setIsPayableOpen(false)} />
            </Dialog>
            <Dialog isOpen={isReceivableOpen} onClose={() => setIsReceivableOpen(false)} title="Conta a Receber">
                <LedgerForm type="RECEIVABLE" onSuccess={() => setIsReceivableOpen(false)} />
            </Dialog>
        </div>
    )
}

function LedgerForm({ type, onSuccess }: { type: 'PAYABLE' | 'RECEIVABLE', onSuccess: () => void }) {
    const { addData } = useData()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [formData, setFormData] = useState({
        description: '',
        value: '',
        notes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addData({
            type,
            ...formData,
            date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            value: Number(formData.value),
            status: 'PENDING'
        })
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 flex flex-col">
                <Label>{type === 'PAYABLE' ? 'Vencimento' : 'Data Prevista'}</Label>
                <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="space-y-2">
                <Label>{type === 'PAYABLE' ? 'Descrição' : 'Devedor/Fonte'}</Label>
                <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} required />
            </div>
            <div className="space-y-2">
                <Label>Obs</Label>
                <Input value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    )
}
