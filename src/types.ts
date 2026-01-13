export type TransactionType =
    | 'EXPENSE'
    | 'INCOME'
    | 'ACCOUNT'
    | 'CATEGORY'
    | 'PAYMENT_METHOD'
    | 'PAYABLE'
    | 'RECEIVABLE'
    | 'BUDGET_DISTRIBUTION'
    | 'SUBSCRIPTION'

export interface AppData {
    id: string
    type: TransactionType
    date?: string // ISO string - Used as billing date (YYYY-MM-DD or just DD?) - For subscription, store billingDay in date or value? Let's add specific field or use value.
    // Actually, AppData is flat. Let's add generic fields or reuse. 
    // For Subscription: 
    // description: Name
    // value: Amount
    // notes: billingDay (string "DD") or add new optional field?
    // Let's add optional fields to AppData for flexibility
    billingDay?: number
    active?: boolean

    description?: string
    value?: number
    category?: string
    account?: string
    paymentMethod?: string
    status?: string // 'PAID', 'PENDING'
    notes?: string
    relatedId?: string // For linking transactions
}

// Helper types for specific views
export interface Expense extends AppData {
    type: 'EXPENSE'
}

export interface Subscription extends AppData {
    type: 'SUBSCRIPTION'
    billingDay: number
    active: boolean
}

export interface Income extends AppData {
    type: 'INCOME'
}

export interface Account extends AppData {
    type: 'ACCOUNT'
    name: string // Stored in description
    initialBalance?: number // Stored in value
}

export interface Category extends AppData {
    type: 'CATEGORY'
    name: string // Stored in description
}

export interface PaymentMethod extends AppData {
    type: 'PAYMENT_METHOD'
    name: string // Stored in description
}
