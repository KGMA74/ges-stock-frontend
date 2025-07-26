export interface User {  
  id: number;
  username: string;
  phone: string;
  email: string;
  fullname: string;
  is_superuser: boolean;
  is_active: boolean;
  is_staff: boolean;
  last_login: string
  store: Store;
}

export interface Store {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 🏪 Modèles de gestion de stock
export interface Warehouse {
  id: number
  name: string
  address?: string
  store: number
  is_active: boolean
  created_at: string
}

export interface Employee {
  id: number
  fullname: string
  phone?: string
  position: 'vendeur' | 'caissier' | 'magasinier' | 'manager' | 'autre'
  salary: string
  hire_date: string
  store: number
  is_active: boolean
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  store: number
  is_active: boolean
  created_at: string
}

export interface Customer {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  store: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: number
  reference: string
  name: string
  description?: string
  unit: string
  min_stock_alert: number
  store: number
  is_active: boolean
  created_at: string
  total_stock?: number
}

export interface ProductStock {
  id: number
  product: Product
  warehouse: Warehouse
  quantity: number
  last_updated: string
}

export interface Account {
  id: number
  name: string
  account_type: 'bank' | 'cash'
  balance: string
  store: number
  is_active: boolean
  created_at: string
}

export interface StockEntry {
  id: number
  entry_number: string
  supplier: number
  supplier_name: string
  warehouse: number
  warehouse_name: string
  total_amount: string
  notes?: string
  created_by: number
  created_by_name: string
  created_at: string
  items?: StockEntryItem[]
}

export interface StockEntryItem {
  id: number
  stock_entry: number
  product: Product
  quantity: number
  purchase_price: string
  total_price: string
}

export interface StockExit {
  id: number
  exit_number: string
  customer: number
  customer_name: string
  warehouse: number
  warehouse_name: string
  total_amount: string
  notes?: string
  created_by: number
  created_by_name: string
  created_at: string
  items?: StockExitItem[]
}

export interface StockExitItem {
  id: number
  stock_exit: number
  product: Product
  quantity: number
  sale_price: string
  total_price: string
}

export interface Invoice {
  id: number
  invoice_number: string
  stock_exit: StockExit
  customer?: Customer
  customer_name?: string
  total_amount: string
  created_at: string
}

export interface FinancialTransaction {
  id: number
  transaction_number: string
  transaction_type: 'purchase' | 'sale' | 'transfer' | 'adjustment'
  amount: string
  from_account?: Account
  to_account?: Account
  stock_entry?: number
  stock_exit?: number
  description?: string
  created_by: User
  created_at: string
}

// Types pour les formulaires
export interface StockEntryForm {
  supplier: number
  warehouse: number
  notes?: string
  items: {
    product: number
    quantity: number
    purchase_price: string
  }[]
}

export interface StockExitForm {
  customer?: number
  customer_name?: string
  warehouse: number
  notes?: string
  items: {
    product: number
    quantity: number
    sale_price: string
  }[]
}

export interface ProductForm {
  reference: string
  name: string
  description?: string
  unit: string
  min_stock_alert: number
}

// Types pour les filtres et pagination
export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface StockFilter {
  search?: string
  warehouse?: number
  product?: number
  low_stock?: boolean
}

export interface TransactionFilter {
  start_date?: string
  end_date?: string
  transaction_type?: string
  account?: number
}