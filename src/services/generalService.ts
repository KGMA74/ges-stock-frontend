import api from "./api";
import { 
  Warehouse, 
  Supplier, 
  Customer, 
  Employee, 
  Account, 
  PaginatedResponse 
} from "@/lib/types";

export const generalService = {
  // === MAGASINS/ENTREPÔTS ===
  
  getWarehouses: async (): Promise<Warehouse[]> => {
    const { data } = await api.get("warehouses/");
    return data.results || data;
  },

  getWarehouse: async (id: number): Promise<Warehouse> => {
    const { data } = await api.get(`warehouses/${id}/`);
    return data;
  },

  createWarehouse: async (warehouseData: Omit<Warehouse, 'id' | 'created_at' | 'store'>): Promise<Warehouse> => {
    const { data } = await api.post("warehouses/", warehouseData);
    return data;
  },

  updateWarehouse: async (id: number, warehouseData: Partial<Warehouse>): Promise<Warehouse> => {
    const { data } = await api.patch(`warehouses/${id}/`, warehouseData);
    return data;
  },

  deleteWarehouse: async (id: number): Promise<void> => {
    await api.delete(`warehouses/${id}/`);
  },

  // === FOURNISSEURS ===
  
  getSuppliers: async (params?: { search?: string; page?: number }): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await api.get("suppliers/", { params });
    return data;
  },

  getSupplier: async (id: number): Promise<Supplier> => {
    const { data } = await api.get(`suppliers/${id}/`);
    return data;
  },

  createSupplier: async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'store'>): Promise<Supplier> => {
    const { data } = await api.post("suppliers/", supplierData);
    return data;
  },

  updateSupplier: async (id: number, supplierData: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await api.patch(`suppliers/${id}/`, supplierData);
    return data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await api.delete(`suppliers/${id}/`);
  },

  // Recherche rapide de fournisseurs
  searchSuppliers: async (query: string): Promise<Supplier[]> => {
    const { data } = await api.get("suppliers/search/", { 
      params: { search: query, limit: 10 } 
    });
    return data.results || data;
  },

  // === CLIENTS ===
  
  getCustomers: async (params?: { search?: string; page?: number }): Promise<PaginatedResponse<Customer>> => {
    const { data } = await api.get("customers/", { params });
    return data;
  },

  getCustomer: async (id: number): Promise<Customer> => {
    const { data } = await api.get(`customers/${id}/`);
    return data;
  },

  createCustomer: async (customerData: Omit<Customer, 'id' | 'created_at' | 'store'>): Promise<Customer> => {
    const { data } = await api.post("customers/", customerData);
    return data;
  },

  updateCustomer: async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.patch(`customers/${id}/`, customerData);
    return data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await api.delete(`customers/${id}/`);
  },

  // Recherche rapide de clients
  searchCustomers: async (query: string): Promise<Customer[]> => {
    const { data } = await api.get("customers/search/", { 
      params: { search: query, limit: 10 } 
    });
    return data.results || data;
  },

  // === EMPLOYÉS ===
  
  getEmployees: async (params?: { search?: string; page?: number }): Promise<PaginatedResponse<Employee>> => {
    const { data } = await api.get("employees/", { params });
    return data;
  },

  getEmployee: async (id: number): Promise<Employee> => {
    const { data } = await api.get(`employees/${id}/`);
    return data;
  },

  createEmployee: async (employeeData: Omit<Employee, 'id' | 'created_at' | 'store'>): Promise<Employee> => {
    const { data } = await api.post("employees/", employeeData);
    return data;
  },

  updateEmployee: async (id: number, employeeData: Partial<Employee>): Promise<Employee> => {
    const { data } = await api.patch(`employees/${id}/`, employeeData);
    return data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await api.delete(`employees/${id}/`);
  },

  // === COMPTES ===
  
  getAccounts: async (): Promise<Account[]> => {
    const { data } = await api.get("accounts/");
    return data.results || data;
  },

  getAccount: async (id: number): Promise<Account> => {
    const { data } = await api.get(`accounts/${id}/`);
    return data;
  },

  createAccount: async (accountData: Omit<Account, 'id' | 'created_at' | 'store'>): Promise<Account> => {
    const { data } = await api.post("accounts/", accountData);
    return data;
  },

  updateAccount: async (id: number, accountData: Partial<Account>): Promise<Account> => {
    const { data } = await api.patch(`accounts/${id}/`, accountData);
    return data;
  },

  deleteAccount: async (id: number): Promise<void> => {
    await api.delete(`accounts/${id}/`);
  }
};
