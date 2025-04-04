import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReceiptData } from "@/utils/pdf/pdfTypes";

// Function to generate a receipt PDF
export const generateReceiptPdf = (receiptData: ReceiptData): jsPDF => {
  const doc = new jsPDF();

  // Default values and safe access
  const storeName = receiptData.storeName || "Your Store";
  const order = receiptData.order || receiptData; // Use the direct data if 'order' is not present
  const id = order.id || receiptData.id || "N/A";
  const date = order.date || receiptData.date || new Date();
  const items = order.items || receiptData.items || [];
  const total = order.total || receiptData.total || 0;
  const tax = order.tax || receiptData.tax || 0;
  const customerName = order.customerName || receiptData.customerName || "Guest";
  const paymentMethod = order.paymentMethod || receiptData.paymentMethod || "Cash";
  const notes = order.notes || receiptData.notes || "";
  const isMerchantCopy = receiptData.isMerchantCopy || false;

  // Set document properties
  doc.setProperties({
    title: `Receipt - ${id}`,
    subject: `Order Receipt for ${customerName}`,
    author: storeName,
    keywords: 'receipt, order, purchase',
  });

  // Add store name and receipt title
  doc.setFontSize(18);
  doc.text(storeName, 14, 20);
  doc.setFontSize(12);
  doc.text(`Receipt ${isMerchantCopy ? "(Merchant Copy)" : ""}`, 14, 28);

  // Add order information
  doc.setFontSize(10);
  doc.text(`Receipt ID: ${id}`, 14, 36);
  doc.text(`Date: ${date.toLocaleDateString()}`, 14, 42);
  doc.text(`Customer: ${customerName}`, 14, 48);
  doc.text(`Payment Method: ${paymentMethod}`, 14, 54);

  let currentY = 62;

  // Prepare table rows
  const tableRows = items.map((item) => [
    item.name,
    item.quantity,
    `$${item.price.toFixed(2)}`,
    `$${(item.price * item.quantity).toFixed(2)}`,
  ]);

  // Add line items table
  doc.autoTable({
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableRows,
    startY: currentY,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Add totals
  doc.setFontSize(12);
  doc.text(`Subtotal: $${(total - tax).toFixed(2)}`, 14, currentY);
  doc.text(`Tax: $${tax.toFixed(2)}`, 14, currentY + 6);
  doc.setFontSize(14);
  doc.text(`Total: $${total.toFixed(2)}`, 14, currentY + 12);

  // Add notes
  if (notes) {
    doc.setFontSize(10);
    doc.text(`Notes: ${notes}`, 14, currentY + 20);
  }

  // Add footer
  doc.setFontSize(9);
  doc.text('Thank you for your purchase!', 14, doc.internal.pageSize.height - 10);

  return doc;
};
