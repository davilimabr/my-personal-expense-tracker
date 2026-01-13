export const PAYMENT_METHODS = [
    { id: 'PM_CREDIT', description: 'Crédito' },
    { id: 'PM_DEBIT', description: 'Débito' },
    { id: 'PM_PIX', description: 'Pix' },
    { id: 'PM_CASH', description: 'Espécie' },
    { id: 'PM_INVOICE', description: 'Virou fatura' }
] as const

export const PM_IDS = {
    CREDIT: 'PM_CREDIT',
    DEBIT: 'PM_DEBIT',
    PIX: 'PM_PIX',
    CASH: 'PM_CASH',
    INVOICE: 'PM_INVOICE'
} as const
