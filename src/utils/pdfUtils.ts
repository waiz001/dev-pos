
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, Customer, Product, paymentMethods } from "./data";

// Extend the jsPDF type definition to include the autoTable method and its return type
interface AutoTableOutput {
  finalY: number;
  startY: number;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => AutoTableOutput;
  previousAutoTable?: {
    finalY: number;
  };
}

/**
 * Generate a Daily Sales Report PDF
 */
export const generateDailySalesReportPDF = (orders: Order[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
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
  const finalY = paymentTable.finalY || 70;
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
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200] // Receipt width: 80mm (standard thermal receipt width)
  }) as jsPDFWithAutoTable;

  // Set font sizes
  const titleSize = 12;
  const normalSize = 9;
  const smallSize = 8;
  
  // Position tracking
  let yPos = 10;
  const xCenter = 40; // Center of the receipt
  const xLeft = 5;
  const xRight = 75;
  
  // Company Info
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text("Your Company", xCenter, yPos, { align: "center" });
  
  // Contact Information
  yPos += 7;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  doc.text("Tel:+5 555-555-5555", xCenter, yPos, { align: "center" });
  
  yPos += 5;
  doc.text("Tax ID: US12345671", xCenter, yPos, { align: "center" });
  
  yPos += 5;
  doc.text("info@yourcompany.com", xCenter, yPos, { align: "center" });
  
  yPos += 5;
  doc.text("http://www.example.com", xCenter, yPos, { align: "center" });
  
  // Server Information
  yPos += 10;
  doc.text(`Served by ${order.isMerchantCopy ? 'Staff' : order.customerName}`, xCenter, yPos, { align: "center" });
  
  // Order number
  yPos += 10;
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text(order.id.substring(0, 3), xCenter, yPos, { align: "center" });
  
  // If it's a merchant copy, add a watermark
  if (order.isMerchantCopy) {
    doc.setTextColor(200, 200, 200);  // Light gray color
    doc.setFontSize(20);
    doc.text("MERCHANT COPY", xCenter, 120, { 
      align: "center",
      angle: 45
    });
    doc.setTextColor(0, 0, 0);  // Reset to black
  }
  
  // Items
  yPos += 15;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  
  // Items table with columns for description and price
  let itemsData = [];
  
  // Add each item to the table
  order.items.forEach(item => {
    // Add the item name and price
    itemsData.push([
      `${item.name}`,
      `$ ${item.price.toFixed(2)}`
    ]);
    
    // Add the quantity and subtotal on next line, indented
    itemsData.push([
      `  ${item.quantity.toFixed(2)} Units x $ ${item.price.toFixed(2)}`,
      ``
    ]);
  });
  
  // Create the items table
  const itemsTable = doc.autoTable({
    startY: yPos,
    head: [["Item", "Price"]],
    body: itemsData,
    theme: 'plain',
    styles: {
      fontSize: normalSize,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 20, halign: 'right' }
    },
    margin: { left: xLeft, right: 5 },
  });
  
  // Get the final Y position after the table
  yPos = itemsTable.finalY + 10;
  
  // Total section
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", xLeft, yPos);
  doc.text(`$ ${order.total.toFixed(2)}`, xRight, yPos, { align: "right" });
  
  // Payment details
  yPos += 8;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  const paymentMethod = paymentMethods.find(p => p.id === order.paymentMethod);
  doc.text(paymentMethod ? paymentMethod.name : order.paymentMethod, xLeft, yPos);
  
  // Cash amount given and change (for cash payments)
  if (order.paymentMethod === "cash") {
    // Example values, in a real app these would come from the payment data
    const cashGiven = order.total + 12.05; // Adding example change amount
    const change = cashGiven - order.total;
    
    yPos += 8;
    doc.text("Cash", xLeft, yPos);
    doc.text(cashGiven.toFixed(2), xRight, yPos, { align: "right" });
    
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("CHANGE", xLeft, yPos);
    doc.text(`$ ${change.toFixed(2)}`, xRight, yPos, { align: "right" });
  }
  
  // Tax breakdown
  yPos += 12;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  
  // Tax table
  const taxAmount = order.tax || (order.total * 0.15); // Using 15% if tax not provided
  const baseAmount = order.total - taxAmount;
  
  const taxTable = doc.autoTable({
    startY: yPos,
    head: [["Tax", "Amount", "Base", "Total"]],
    body: [["15%", taxAmount.toFixed(2), baseAmount.toFixed(2), order.total.toFixed(2)]],
    theme: 'plain',
    styles: {
      fontSize: normalSize,
      cellPadding: 2,
    },
    margin: { left: xLeft, right: 5 },
  });
  
  // Footer with thank you message
  yPos = taxTable.finalY + 15;
  doc.setFontSize(normalSize);
  doc.text("Thanks for shopping with us!", xCenter, yPos, { align: "center" });
  
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
