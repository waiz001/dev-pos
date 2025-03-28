
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, paymentMethods, stores } from "../data";
import "../pdf/pdfTypes";

/**
 * Generate a Daily Sales Report PDF
 */
export const generateDailySalesReportPDF = (orders: Order[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("Daily Sales Report", 14, 22);
  
  // Date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  
  // Total Information
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
  doc.text(`Total Orders: ${orders.length}`, 14, 42);
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, 52);
  
  // Payment Method Breakdown
  doc.setFontSize(14);
  doc.text("Payment Method Breakdown", 14, 65);
  
  // Calculate payment method totals
  const paymentSummary = {};
  paymentMethods.forEach(method => {
    paymentSummary[method.id] = orders
      .filter(order => order.paymentMethod === method.id)
      .reduce((sum, order) => sum + order.total, 0);
  });
  
  // Payment method data
  const paymentData = paymentMethods.map(method => [
    method.name,
    `$${paymentSummary[method.id]?.toFixed(2) || '0.00'}`
  ]);
  
  // Add the payment method table
  if (paymentData.length > 0) {
    doc.autoTable({
      startY: 70,
      head: [["Payment Method", "Amount"]],
      body: paymentData
    });
  } else {
    doc.text("No payment data available", 14, 75);
  }
  
  // Start position for Orders table (after payment table)
  let yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 90;
  
  // Store Breakdown if applicable
  if (orders.some(order => order.storeId)) {
    doc.setFontSize(14);
    doc.text("Store Breakdown", 14, yPos);
    yPos += 10;
    
    // Calculate store totals
    const storeSummary = {};
    stores.forEach(store => {
      storeSummary[store.id] = orders
        .filter(order => order.storeId === store.id)
        .reduce((sum, order) => sum + order.total, 0);
    });
    
    // Store data
    const storeData = stores.map(store => [
      store.name,
      `$${storeSummary[store.id]?.toFixed(2) || '0.00'}`
    ]);
    
    // Add the store table
    if (storeData.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [["Store", "Amount"]],
        body: storeData
      });
    }
    
    // Update yPos for Orders table
    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 20;
  }
  
  // Orders Table
  doc.setFontSize(14);
  doc.text("Order Details", 14, yPos);
  
  const orderRows = orders.map(order => {
    const paymentMethod = paymentMethods.find(p => p.id === order.paymentMethod);
    const store = order.storeId ? stores.find(s => s.id === order.storeId)?.name : 'N/A';
    return [
      order.id.substring(0, 8), // Truncate ID for readability
      order.customerName || "Walk-in Customer",
      new Date(order.date).toLocaleString(),
      paymentMethod ? paymentMethod.name : order.paymentMethod,
      store,
      `$${order.total.toFixed(2)}`
    ];
  });
  
  // Add the orders table
  if (orderRows.length > 0) {
    doc.autoTable({
      startY: yPos + 5,
      head: [["Order ID", "Customer", "Date", "Payment", "Store", "Total"]],
      body: orderRows
    });
  } else {
    doc.text("No orders available", 14, yPos + 10);
  }
  
  return doc;
};
