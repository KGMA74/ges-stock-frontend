'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Printer, Download } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'En attente',
  paid: 'Payée',
  cancelled: 'Annulée',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = parseInt(params.id as string);

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceService.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });

  const handlePrint = async () => {
    try {
      const printData = await invoiceService.getInvoicePrintData(invoiceId);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generatePrintHTML(printData));
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    }
  };

  const generatePrintHTML = (printData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${printData.invoice.invoice_number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-info { 
              margin-bottom: 30px; 
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .customer-info { 
              margin-bottom: 30px; 
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .totals { 
              text-align: right; 
              margin-top: 20px;
              border-top: 2px solid #333;
              padding-top: 15px;
            }
            .total-row { 
              font-size: 18px;
              font-weight: bold; 
              color: #2563eb;
            }
            .notes {
              margin-top: 30px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 5px;
            }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE</h1>
            <h2>${printData.company_info.name}</h2>
          </div>
          
          <div class="company-info">
            <h3>Informations de l'entreprise</h3>
            <p><strong>${printData.company_info.name}</strong></p>
            <p>${printData.company_info.address}</p>
            <p>Téléphone: ${printData.company_info.phone}</p>
            <p>Email: ${printData.company_info.email}</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Détails de la facture</h3>
              <p><strong>N° Facture:</strong> ${printData.invoice.invoice_number}</p>
              <p><strong>Date d'émission:</strong> ${new Date(printData.invoice.date).toLocaleDateString('fr-FR')}</p>
              ${printData.invoice.due_date ? `<p><strong>Date d'échéance:</strong> ${new Date(printData.invoice.due_date).toLocaleDateString('fr-FR')}</p>` : ''}
              <p><strong>Statut:</strong> ${statusLabels[printData.invoice.status]}</p>
            </div>
          </div>
          
          <div class="customer-info">
            <h3>Informations client</h3>
            <p><strong>${printData.invoice.customer.name}</strong></p>
            <p>${printData.invoice.customer.address}</p>
            <p>Téléphone: ${printData.invoice.customer.phone}</p>
            <p>Email: ${printData.invoice.customer.email}</p>
          </div>
          
          <h3>Détail des articles</h3>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix unitaire</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${printData.items_with_totals.map((item: any) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${item.unit_price}</td>
                  <td style="text-align: right;">${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Sous-total: ${printData.formatted_totals.subtotal}</strong></p>
            <p><strong>TVA (18%): ${printData.formatted_totals.tax_amount}</strong></p>
            <p class="total-row"><strong>TOTAL À PAYER: ${printData.formatted_totals.total_amount}</strong></p>
          </div>
          
          ${printData.invoice.notes ? `
            <div class="notes">
              <h4>Notes:</h4>
              <p>${printData.invoice.notes}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            <p>Merci pour votre confiance!</p>
            <p>Facture générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </body>
      </html>
    `;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Erreur lors du chargement de la facture
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Facture {invoice.invoice_number}</h1>
            <p className="text-gray-600">
              Créée le {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la facture */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro de facture</p>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <Badge className={statusColors[invoice.status]}>
                    {statusLabels[invoice.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'émission</p>
                  <p className="font-medium">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'échéance</p>
                  <p className="font-medium">
                    {invoice.due_date 
                      ? new Date(invoice.due_date).toLocaleDateString('fr-FR')
                      : 'Non définie'
                    }
                  </p>
                </div>
              </div>
              
              {invoice.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="mt-1">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Code: {item.product.barcode}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(item.unit_price))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(item.total_amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totaux */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{formatCurrency(parseFloat(invoice.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA:</span>
                      <span>{formatCurrency(parseFloat(invoice.tax_amount))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(parseFloat(invoice.total_amount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations client et boutique */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{invoice.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="text-sm">{invoice.customer.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="text-sm">{invoice.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm">{invoice.customer.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Boutique */}
          <Card>
            <CardHeader>
              <CardTitle>Boutique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{invoice.store.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="text-sm">{invoice.store.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="text-sm">{invoice.store.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm">{invoice.store.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
