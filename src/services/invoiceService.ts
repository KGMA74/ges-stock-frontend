import api from './api';
import { Invoice, CreateInvoiceData, UpdateInvoiceData, InvoicePrintData } from '@/types/invoice';

export const invoiceService = {
  // Récupérer toutes les factures
  getInvoices: async (): Promise<Invoice[]> => {
    const { data } = await api.get('/invoices/');
    return data;
  },

  // Récupérer une facture par ID
  getInvoice: async (id: number): Promise<Invoice> => {
    const { data } = await api.get(`/invoices/${id}/`);
    return data;
  },

  // Créer une nouvelle facture
  createInvoice: async (invoiceData: CreateInvoiceData): Promise<Invoice> => {
    const { data } = await api.post('/invoices/', invoiceData);
    return data;
  },

  // Mettre à jour une facture
  updateInvoice: async (id: number, invoiceData: UpdateInvoiceData): Promise<Invoice> => {
    const { data } = await api.patch(`/invoices/${id}/`, invoiceData);
    return data;
  },

  // Supprimer une facture
  deleteInvoice: async (id: number): Promise<void> => {
    await api.delete(`/invoices/${id}/`);
  },

  // Récupérer les données d'impression
  getInvoicePrintData: async (id: number): Promise<InvoicePrintData> => {
    const { data } = await api.get(`/invoices/${id}/print_data/`);
    return data;
  },

  // Télécharger le PDF de la facture
  downloadInvoicePDF: async (id: number): Promise<Blob> => {
    const response = await api.get(`/invoices/${id}/download-pdf/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Imprimer une facture (télécharge le PDF)
  printInvoice: async (id: number): Promise<void> => {
    const blob = await invoiceService.downloadInvoicePDF(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
