
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/utils/data';
import { ReceiptData } from './pdfTypes';
import { stores } from '@/utils/data';

export const generateReceiptPdf = (data: ReceiptData): jsPDF => {
  // Initialize variables from either format
  const order = data.order || data;
  const items = order.items || data.items || [];
  const total = order.total || data.total || 0;
  const tax = order.tax || data.tax || 0;
  const date = order.date || data.date || new Date();
  const paymentMethod = order.paymentMethod || data.paymentMethod || 'cash';
  const customerName = order.customerName || data.customerName || 'Guest';
  const notes = order.notes || data.notes || '';
  const id = order.id || data.id || 'preview';
  const storeId = order.storeId || data.storeId || '';
  const isMerchantCopy = data.isMerchantCopy || false;
  
  // Find store name from storeId
  const storeName = data.storeName || 
    (storeId ? stores.find(s => s.id === storeId)?.name || 'Store' : 'Store');
    
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
  
  // Add merchant copy watermark if needed
  if (isMerchantCopy) {
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text("MERCHANT COPY", 40, yPos + 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  
  yPos += lineHeight;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RECEIPT', 40, yPos, { align: 'center' });

  // Date and Order information
  yPos += lineHeight;
  doc.text(`Date: ${new Date(date).toLocaleString()}`, 10, yPos);
  
  yPos += lineHeight - 2;
  doc.text(`Order: #${typeof id === 'string' ? id.substring(0, 8) : id}`, 10, yPos);

  // Customer information if available
  if (customerName && customerName !== 'Guest') {
    yPos += lineHeight;
    doc.text(`Customer: ${customerName}`, 10, yPos);
  }

  // Line separator
  yPos += lineHeight;
  doc.setDrawColor(200, 200, 200);
  doc.line(10, yPos, 70, yPos);

  // Items table
  yPos += 2;
  
  // Calculate subtotal, tax, and final total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Use autoTable with configuration object syntax
  doc.autoTable({
    startY: yPos,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: items.map(item => [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]),
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
  
  yPos += lineHeight - 3;
  doc.text(`Tax:`, 40, yPos);
  doc.text(`$${tax.toFixed(2)}`, 70, yPos, { align: 'right' });
  
  yPos += lineHeight - 3;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 40, yPos);
  doc.text(`$${total.toFixed(2)}`, 70, yPos, { align: 'right' });
  
  // Payment method
  yPos += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${paymentMethod}`, 10, yPos);
  
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

// Alias for backward compatibility
export const generateOrderReceiptPDF = generateReceiptPdf;
