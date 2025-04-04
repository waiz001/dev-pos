import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SalesReportData, Order } from "@/utils/data";

// Function to generate a daily sales report PDF
export const generateDailySalesReportPDF = (orders: Order[]): jsPDF => {
  const doc = new jsPDF();
  const title = "Daily Sales Report";
  const date = new Date().toLocaleDateString();
  let currentY = 20;

  // Set document information
  doc.setProperties({
    title: title,
    subject: "Daily Sales Report",
    author: "Your Company",
    keywords: "sales, report, daily",
  });

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, currentY);

  // Add date
  doc.setFontSize(12);
  currentY += 10;
  doc.text(`Date: ${date}`, 14, currentY);

  // Calculate totals
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Add summary
  doc.setFontSize(12);
  currentY += 10;
  doc.text(`Summary:`, 14, currentY);

  doc.setFontSize(10);
  currentY += 6;
  doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 20, currentY);

  currentY += 6;
  doc.text(`Total Orders: ${totalOrders}`, 20, currentY);

  currentY += 6;
  doc.text(`Average Order Value: $${averageOrderValue.toFixed(2)}`, 20, currentY);

  // Payment method breakdown
  const paymentMethods: Record<string, number> = {};
  orders.forEach((order) => {
    paymentMethods[order.paymentMethod] =
      (paymentMethods[order.paymentMethod] || 0) + order.total;
  });

  const paymentMethodsRows = Object.entries(paymentMethods).map(
    ([method, amount]) => [method, `$${amount.toFixed(2)}`]
  );

  doc.setFontSize(12);
  currentY += 10;
  doc.text(`Payment Methods:`, 14, currentY);

  doc.autoTable({
    head: [['Payment Method', 'Amount']],
    body: paymentMethodsRows,
    startY: currentY + 5,
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

  currentY = doc.lastAutoTable.finalY || currentY;

  // Top products sold
  const productQuantities: Record<string, { quantity: number; total: number }> =
    {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productQuantities[item.name]) {
        productQuantities[item.name] = { quantity: 0, total: 0 };
      }
      productQuantities[item.name].quantity += item.quantity;
      productQuantities[item.name].total += item.price * item.quantity;
    });
  });

  const topProducts = Object.entries(productQuantities)
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .slice(0, 5);

  const topProductsRows = topProducts.map(
    ([name, { quantity, total }], index) => [
      index + 1,
      name,
      quantity,
      `$${total.toFixed(2)}`,
    ]
  );

  doc.setFontSize(12);
  currentY += 10;
  doc.text(`Top Products Sold:`, 14, currentY);

  doc.autoTable({
    head: [['#', 'Product', 'Qty Sold', 'Revenue']],
    body: topProductsRows,
    startY: currentY + 5,
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

  // Add order details table
  doc.addPage();
  currentY = 20;
  doc.setFontSize(14);
  doc.text(`Order Details:`, 14, currentY);

  const tableRows = orders.flatMap((order, index) => {
    const orderRows = order.items.map((item) => [
      item.name,
      item.price,
      item.quantity,
      `$${(item.price * item.quantity).toFixed(2)}`,
    ]);

    orderRows.push([
      "",
      "",
      "Subtotal:",
      `$${order.total.toFixed(2)}`,
    ]);
    orderRows.push([
      "",
      "",
      "Tax:",
      `$${order.tax.toFixed(2)}`,
    ]);
    orderRows.push([
      "",
      "",
      "Total:",
      `$${(order.total + order.tax).toFixed(2)}`,
    ]);

    return [[`Order #${index + 1} - ${order.customerName}`]].concat(orderRows);
  });

  doc.autoTable({
    head: [['#', 'Item', 'Price', 'Quantity', 'Total']],
    body: [],
    startY: currentY + 10,
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
  
  return doc;
};
