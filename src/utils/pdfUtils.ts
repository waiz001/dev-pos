
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Order, Customer, Product, paymentMethods } from "./data";

// Extend the jsPDF type definition to include the autoTable method
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF & {
      previous: {
        finalY: number;
      };
    };
  }
}

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
  
  // Payment method table
  const paymentData = paymentMethods.map(method => [
    method.name,
    `$${paymentSummary[method.id]?.toFixed(2) || '0.00'}`
  ]);
  
  const paymentTable = doc.autoTable({
    startY: 70,
    head: [["Payment Method", "Amount"]],
    body: paymentData,
  });
  
  // Orders Table
  doc.setFontSize(14);
  const finalY = paymentTable.previous.finalY || 70;
  doc.text("Order Details", 14, finalY + 15);
  
  const orderRows = orders.map(order => {
    const paymentMethod = paymentMethods.find(p => p.id === order.paymentMethod);
    return [
      order.id.substring(0, 8), // Truncate ID for readability
      order.customerName || "Walk-in Customer",
      new Date(order.date).toLocaleString(),
      paymentMethod ? paymentMethod.name : order.paymentMethod,
      `$${order.total.toFixed(2)}`
    ];
  });
  
  doc.autoTable({
    startY: finalY + 20,
    head: [["Order ID", "Customer", "Date", "Payment", "Total"]],
    body: orderRows,
  });
  
  return doc;
};

/**
 * Generate a PDF receipt for an order
 */
export const generateOrderReceiptPDF = (order: Order & { isMerchantCopy?: boolean }) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text("Receipt", 105, 20, { align: "center" });
  
  // If it's a merchant copy, add a watermark
  if (order.isMerchantCopy) {
    doc.setTextColor(200, 200, 200);  // Light gray color
    doc.setFontSize(40);
    doc.text("MERCHANT COPY", 105, 150, { 
      align: "center",
      angle: 45
    });
    doc.setTextColor(0, 0, 0);  // Reset to black
    doc.setFontSize(12);
  }
  
  // Order Info
  doc.setFontSize(12);
  doc.text(`Order #: ${order.id.substring(0, 8)}`, 14, 40);
  doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 14, 50);
  doc.text(`Customer: ${order.customerName || "Walk-in Customer"}`, 14, 60);
  
  const paymentMethod = paymentMethods.find(p => p.id === order.paymentMethod);
  doc.text(`Payment Method: ${paymentMethod ? paymentMethod.name : order.paymentMethod}`, 14, 70);
  
  // Items
  doc.setFontSize(14);
  doc.text("Items", 14, 90);
  
  const itemRows = order.items.map(item => [
    item.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.price * item.quantity).toFixed(2)}`
  ]);
  
  const itemsTable = doc.autoTable({
    startY: 95,
    head: [["Item", "Qty", "Price", "Total"]],
    body: itemRows,
  });
  
  const finalY = itemsTable.previous.finalY || 95;
  
  // Subtotal, Tax, and Total
  doc.text(`Subtotal: $${(order.total - (order.tax || 0)).toFixed(2)}`, 140, finalY + 15, { align: "right" });
  if (order.tax) {
    doc.text(`Tax: $${order.tax.toFixed(2)}`, 140, finalY + 25, { align: "right" });
  }
  doc.text(`Total: $${order.total.toFixed(2)}`, 140, finalY + 35, { align: "right" });
  
  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for your business!", 105, 270, { align: "center" });
  
  return doc;
};

/**
 * Generate Products Template for Excel
 */
export const generateProductsTemplate = () => {
  const headers = ["id", "name", "price", "category", "description", "barcode", "inStock"];
  const sampleProduct = {
    id: "product-123", 
    name: "Sample Product",
    price: 9.99,
    category: "category-id",
    description: "Sample description",
    barcode: "123456789",
    inStock: 100
  };
  
  return { headers, data: [Object.values(sampleProduct)] };
};

/**
 * Generate Customers Template for Excel
 */
export const generateCustomersTemplate = () => {
  const headers = ["id", "name", "email", "phone", "address", "notes"];
  const sampleCustomer = {
    id: "customer-123",
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567",
    address: "123 Main St, Anytown",
    notes: "Sample customer notes"
  };
  
  return { headers, data: [Object.values(sampleCustomer)] };
};
