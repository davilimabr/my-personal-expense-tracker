import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { generateId } from '../lib/utils'
import type { AppData as AppDataType } from '../types'

interface DataContextType {
    data: AppDataType[]
    loading: boolean
    addData: (item: Omit<AppDataType, 'id'>) => void
    updateData: (id: string, item: Partial<AppDataType>) => void
    deleteData: (id: string) => void
    refreshData: () => Promise<void>
    currentDate: Date
    setCurrentDate: (date: Date) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppDataType[]>([])
    const [loading, setLoading] = useState(true)
    const [dirty, setDirty] = useState(false)

    // Load initial data
    const refreshData = useCallback(async () => {
        setLoading(true)
        try {
            if (!window.ipcRenderer) {
                console.warn("IPC Renderer not available. Run in Electron.")
                setLoading(false)
                return
            }
            const loaded = await window.ipcRenderer.readData()
            setData(loaded)
        } catch (err) {
            console.error("Failed to load data", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshData()
    }, [refreshData])

    // Subscription Processing Effect
    useEffect(() => {
        if (loading || data.length === 0) return

        const subscriptions = data.filter((d: any) => d.type === 'SUBSCRIPTION' && d.active === true || d.active === 'true')
        const today = new Date()
        const currentMonthStr = today.toISOString().slice(0, 7) // YYYY-MM

        const newExpenses: AppDataType[] = []

        subscriptions.forEach((sub: any) => {
            const billingDay = Number(sub.billingDay)
            // Check if already generated for this month
            const exists = data.find((d: any) => {
                return d.type === 'EXPENSE' &&
                    d.relatedId === sub.id &&
                    d.date?.startsWith(currentMonthStr)
            })

            if (!exists && today.getDate() >= billingDay) {
                // Generate Expense
                const expenseDate = new Date(today.getFullYear(), today.getMonth(), billingDay)

                newExpenses.push({
                    id: generateId(),
                    type: 'EXPENSE',
                    date: expenseDate.toISOString().split('T')[0],
                    description: sub.description,
                    value: Number(sub.value),
                    category: sub.category,
                    account: sub.account,
                    relatedId: sub.id,
                    notes: 'Gerado automaticamente pela assinatura'
                })
            }
        })

        if (newExpenses.length > 0) {
            console.log("Generating subscriptions for this month:", newExpenses)
            // Add directly, which will trigger auto-save via 'dirty' if we set it,
            // or we can manually set dirty. 
            // Note: calling setData inside useEffect(data) can loop if not careful.
            // But we checked !exists, so once added, exists will be true next render.
            setData(prev => [...prev, ...newExpenses])
            setDirty(true)
        }
    }, [data, loading])

    // Auto-save effect
    useEffect(() => {
        if (!dirty) return

        const timeout = setTimeout(async () => {
            console.log('Auto-saving...', data.length, 'records')
            if (window.ipcRenderer) {
                await window.ipcRenderer.saveData(data)
            }
            setDirty(false)
        }, 2000) // 2 second debounce

        return () => clearTimeout(timeout)
    }, [data, dirty])

    // Save on unmount / close is handled by IPC listener in main, 
    // but we can also force a save before unload if needed. 
    // For now, rely on periodic saves + manual triggers if needed.

    const addData = (item: Omit<AppDataType, 'id'>) => {
        const newItem = { ...item, id: generateId() }
        setData(prev => [...prev, newItem])
        setDirty(true)
    }

    const updateData = (id: string, item: Partial<AppDataType>) => {
        setData(prev => prev.map(d => d.id === id ? { ...d, ...item } : d))
        setDirty(true)
    }

    const deleteData = (id: string) => {
        setData(prev => prev.filter(d => d.id !== id))
        setDirty(true)
    }

    const [currentDate, setCurrentDate] = useState(new Date())

    return (
        <DataContext.Provider value={{
            data,
            loading,
            addData,
            updateData,
            deleteData,
            refreshData,
            currentDate,
            setCurrentDate
        }}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}
