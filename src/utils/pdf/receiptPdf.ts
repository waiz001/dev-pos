
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/utils/data';
import { ReceiptData } from './pdfTypes';

export const generateReceiptPdf = (data: ReceiptData): jsPDF => {
  const { storeName, order, customer, taxRate, notes } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Receipt-like size
  });

  const lineHeight = 8;
  let yPos = 10;

  // Store information (header)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(storeName, 40, yPos, { align: 'center' });
  
  yPos += lineHeight;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RECEIPT', 40, yPos, { align: 'center' });

  // Date and Order information
  yPos += lineHeight;
  doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 10, yPos);
  
  yPos += lineHeight - 2;
  doc.text(`Order: #${order.id.substring(0, 8)}`, 10, yPos);

  // Customer information if available
  if (customer) {
    yPos += lineHeight;
    doc.text(`Customer: ${customer.name}`, 10, yPos);
  }

  // Line separator
  yPos += lineHeight;
  doc.setDrawColor(200, 200, 200);
  doc.line(10, yPos, 70, yPos);

  // Items table
  yPos += 2;
  const tableHeaders = [['Item', 'Qty', 'Price', 'Total']];
  
  const tableData = order.items.map(item => [
    item.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.price * item.quantity).toFixed(2)}`
  ]);

  // Calculate subtotal, tax, and final total
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = taxRate ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;

  // Use autoTable with configuration object syntax
  doc.autoTable({
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 1,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' },
      3: { cellWidth: 15, halign: 'right' },
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    margin: { left: 10, right: 10 },
  });

  // Get the Y position after the table
  yPos = (doc as any).lastAutoTable.finalY + 5;

  // Totals section
  doc.text('Subtotal:', 40, yPos);
  doc.text(`$${subtotal.toFixed(2)}`, 70, yPos, { align: 'right' });
  
  if (taxRate) {
    yPos += lineHeight - 3;
    doc.text(`Tax (${taxRate}%):`, 40, yPos);
    doc.text(`$${tax.toFixed(2)}`, 70, yPos, { align: 'right' });
  }
  
  yPos += lineHeight - 3;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 40, yPos);
  doc.text(`$${total.toFixed(2)}`, 70, yPos, { align: 'right' });
  
  // Payment method
  yPos += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${order.paymentMethod}`, 10, yPos);
  
  // Notes if available
  if (notes) {
    yPos += lineHeight;
    doc.text('Notes:', 10, yPos);
    yPos += lineHeight - 3;
    doc.text(notes, 10, yPos);
  }
  
  // Footer
  yPos += lineHeight * 2;
  doc.setFontSize(8);
  doc.text('Thank you for your purchase!', 40, yPos, { align: 'center' });
  
  return doc;
};
