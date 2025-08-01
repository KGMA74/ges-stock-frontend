export interface InvoiceItem {
  id: number;
  product: {
    id: number;
    name: string;
    barcode?: string;
    reference?: string;
    sale_price: string;
  };
  quantity: number;
  unit_price?: string;
  sale_price?: string;
  total_amount?: string;
  total_price?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
  } | null;
  customer_name?: string;
  stock_exit: {
    id: number;
    warehouse: {
      id: number;
      name: string;
      store: {
        id: number;
        name: string;
        description: string;
      };
    };
    items: InvoiceItem[];
    notes?: string;
  };
  total_amount: string;
  // Propriétés de compatibilité
  date?: string;
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface CreateInvoiceData {
  customer?: number;
  customer_name?: string;
  stock_exit: number;
  notes?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface InvoicePrintData {
  invoice: {
    invoice_number: string;
    date: string;
    time: string;
    total_amount: string;
    warehouse: string;
    created_by: string;
    notes?: string;
  };
  store: {
    name: string;
    description: string;
  };
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: {
    product_reference: string;
    product_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
  }[];
}

export interface CreateInvoiceData {
  customer?: number;
  due_date?: string;
  items: {
    product: number;
    quantity: number;
    unit_price: string;
  }[];
  notes?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface InvoicePrintData {
  invoice: Invoice;
  company_info: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  items_with_totals: {
    product_name: string;
    quantity: number;
    unit_price: string;
    total: string;
  }[];
  formatted_totals: {
    subtotal: string;
    tax_amount: string;
    total_amount: string;
  };
}
