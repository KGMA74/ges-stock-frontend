import api from "./api";

export interface Account {
  id: number;
  name: string;
  account_type: 'bank' | 'cash';
  balance: string;
  is_active: boolean;
  created_at: string;
}

export interface AccountTransaction {
  id: number;
  transaction_number: string;
  transaction_type: 'purchase' | 'sale' | 'transfer' | 'adjustment';
  transaction_type_display: string;
  amount: string;
  movement_type: 'credit' | 'debit';
  description: string;
  from_account_name?: string;
  to_account_name?: string;
  stock_exit_number?: string;
  stock_entry_number?: string;
  created_by_name: string;
  created_at: string;
}

export interface AccountTransactionListResponse {
  count: number;
  next: boolean;
  previous: boolean;
  results: AccountTransaction[];
}

export interface CreateAccountData {
  name: string;
  account_type: 'bank' | 'cash';
  balance?: string;
  is_active?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  account_type?: 'bank' | 'cash';
  balance?: string;
  is_active?: boolean;
}

export interface AccountListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Account[];
}

class AccountService {
  private basePath = 'accounts';

  async getAccounts(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
  }): Promise<AccountListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);

    const url = `${this.basePath}/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get<AccountListResponse>(url);
    return response.data;
  }

  async getAccount(id: number): Promise<Account> {
    const response = await api.get<Account>(`${this.basePath}/${id}/`);
    return response.data;
  }

  async createAccount(data: CreateAccountData): Promise<Account> {
    const response = await api.post<Account>(`${this.basePath}/`, data);
    return response.data;
  }

  async updateAccount(id: number, data: UpdateAccountData): Promise<Account> {
    const response = await api.patch<Account>(`${this.basePath}/${id}/`, data);
    return response.data;
  }

  async deleteAccount(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}/`);
  }

  async searchAccounts(query: string, limit: number = 10): Promise<Account[]> {
    const response = await api.get<Account[]>(`${this.basePath}/search/?search=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }

  async getAccountTransactions(
    accountId: number, 
    params?: {
      page?: number;
      page_size?: number;
    }
  ): Promise<AccountTransactionListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());

    const url = `${this.basePath}/${accountId}/transactions/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get<AccountTransactionListResponse>(url);
    return response.data;
  }
}

export const accountService = new AccountService();
