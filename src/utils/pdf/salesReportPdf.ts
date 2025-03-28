
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, PaymentMethod } from '@/utils/data';
import { SalesReportData } from './pdfTypes';

export const generateSalesReportPdf = (data: SalesReportData): jsPDF => {
  const { title, orders, startDate, endDate, totals } = data;
  const doc = new jsPDF();

  // Add the title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add the date range if provided
  doc.setFontSize(12);
  if (startDate && endDate) {
    doc.text(`Period: ${startDate} - ${endDate}`, 14, 32);
  }

  // Add the sales summary section
  doc.setFontSize(14);
  doc.text("Sales Summary", 14, 42);

  const summaryData = [
    ["Total Sales", `$${totals.totalSales.toFixed(2)}`],
    ["Total Orders", totals.totalOrders.toString()],
    ["Average Order Value", `$${totals.averageOrderValue.toFixed(2)}`]
  ];

  // Add payment method breakdown if available
  if (totals.paymentMethods && Object.keys(totals.paymentMethods).length > 0) {
    doc.text("Payment Methods", 14, 78);
    
    const paymentData = Object.entries(totals.paymentMethods).map(([method, amount]) => {
      return [method, `$${amount.toFixed(2)}`];
    });

    // Use autoTable with configuration object syntax
    doc.autoTable({
      startY: 82,
      head: [['Payment Method', 'Amount']],
      body: paymentData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 15 }
    });
  }

  // Create the orders table
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Order Details", 14, 20);

  // Prepare table data
  const tableHeaders = [
    "Order ID", 
    "Date", 
    "Customer", 
    "Items", 
    "Payment Method", 
    "Total"
  ];

  const tableData = orders.map((order) => [
    order.id.substring(0, 8),
    new Date(order.date).toLocaleDateString(),
    order.customerName || "Guest",
    order.items.length.toString(),
    order.paymentMethod,
    `$${order.total.toFixed(2)}`
  ]);

  // Use autoTable with configuration object syntax
  doc.autoTable({
    startY: 25,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 }
    }
  });

  // Add a section for top selling products if available
  if (totals.topProducts && totals.topProducts.length > 0) {
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Top Selling Products", 14, currentY);

    const topProductsData = totals.topProducts.map((product, index) => [
      (index + 1).toString(),
      product.name,
      product.quantity.toString(),
      `$${product.total.toFixed(2)}`
    ]);

    // Use autoTable with configuration object syntax
    doc.autoTable({
      startY: currentY + 5,
      head: [["#", "Product", "Quantity", "Revenue"]],
      body: topProductsData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
  }

  return doc;
};
