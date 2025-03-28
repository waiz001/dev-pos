
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, Customer, Product, paymentMethods, stores } from "./data";

// Extend jsPDF types to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
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
  
  // Payment method data
  const paymentData = paymentMethods.map(method => [
    method.name,
    `$${paymentSummary[method.id]?.toFixed(2) || '0.00'}`
  ]);
  
  // Add the payment method table
  if (paymentData.length > 0) {
    // Fix: Use autoTable as a method with a single configuration object
    doc.autoTable({
      startY: 70,
      head: [["Payment Method", "Amount"]],
      body: paymentData,
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
      // Fix: Use autoTable as a method with a single configuration object
      doc.autoTable({
        startY: yPos,
        head: [["Store", "Amount"]],
        body: storeData,
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
    // Fix: Use autoTable as a method with a single configuration object
    doc.autoTable({
      startY: yPos + 5,
      head: [["Order ID", "Customer", "Date", "Payment", "Store", "Total"]],
      body: orderRows,
    });
  } else {
    doc.text("No orders available", 14, yPos + 10);
  }
  
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
  });

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
  
  // Store Info if available
  if (order.storeId) {
    const store = stores.find(s => s.id === order.storeId);
    if (store) {
      yPos += 7;
      doc.setFontSize(normalSize);
      doc.text(store.name, xCenter, yPos, { align: "center" });
      
      yPos += 5;
      doc.setFontSize(smallSize);
      doc.text(store.address, xCenter, yPos, { align: "center" });
      
      yPos += 4;
      doc.text(store.phone, xCenter, yPos, { align: "center" });
    }
  }
  
  // Contact Information
  yPos += 7;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  doc.text("Tel: +1 555-555-5555", xCenter, yPos, { align: "center" });
  
  yPos += 5;
  doc.text("Tax ID: US12345671", xCenter, yPos, { align: "center" });
  
  // Server Information
  yPos += 10;
  doc.text(`Served by ${order.isMerchantCopy ? 'Staff' : order.customerName}`, xCenter, yPos, { align: "center" });
  
  // Order number and date
  yPos += 7;
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text(`Order #${order.id.substring(0, 6)}`, xCenter, yPos, { align: "center" });
  
  yPos += 7;
  doc.setFontSize(smallSize);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString()}`, xCenter, yPos, { align: "center" });
  
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
  yPos += 12;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  
  // Items table with columns for description and price
  const itemsData = [];
  
  // Add header
  itemsData.push(['Item', 'Qty', 'Price', 'Total']);
  
  // Add each item
  order.items.forEach(item => {
    const subtotal = item.price * item.quantity;
    itemsData.push([
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${subtotal.toFixed(2)}`
    ]);
  });
  
  // Create the items table
  // Fix: Use autoTable as a method with a single configuration object
  doc.autoTable({
    startY: yPos,
    theme: 'plain',
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: order.items.map(item => [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' },
      3: { cellWidth: 15, halign: 'right' }
    },
    margin: { left: xLeft, right: 5 },
  });
  
  // Get the final Y position after the table
  yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 50;
  
  // Totals section
  const subtotal = order.total - (order.tax || 0);
  
  // Draw separator line
  doc.line(xLeft, yPos - 5, xRight, yPos - 5);
  
  // Subtotal
  doc.setFontSize(normalSize);
  doc.text("Subtotal:", xLeft, yPos);
  doc.text(`$${subtotal.toFixed(2)}`, xRight, yPos, { align: "right" });
  
  // Tax
  yPos += 6;
  doc.text("Tax:", xLeft, yPos);
  doc.text(`$${(order.tax || 0).toFixed(2)}`, xRight, yPos, { align: "right" });
  
  // Draw separator line
  yPos += 3;
  doc.line(xLeft, yPos, xRight, yPos);
  
  // Total
  yPos += 6;
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", xLeft, yPos);
  doc.text(`$${order.total.toFixed(2)}`, xRight, yPos, { align: "right" });
  
  // Payment details
  yPos += 8;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  const paymentMethod = paymentMethods.find(p => p.id === order.paymentMethod);
  doc.text(`Payment: ${paymentMethod ? paymentMethod.name : order.paymentMethod}`, xLeft, yPos);
  
  // Cash amount given and change (for cash payments)
  if (order.paymentMethod === "cash") {
    // Example values, in a real app these would come from the payment data
    const cashGiven = order.total + 5.00; // Adding example change amount
    const change = cashGiven - order.total;
    
    yPos += 8;
    doc.text("Cash tendered:", xLeft, yPos);
    doc.text(`$${cashGiven.toFixed(2)}`, xRight, yPos, { align: "right" });
    
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("CHANGE", xLeft, yPos);
    doc.text(`$${change.toFixed(2)}`, xRight, yPos, { align: "right" });
  }
  
  // Footer with thank you message
  yPos += 15;
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  doc.text("Thanks for shopping with us!", xCenter, yPos, { align: "center" });
  
  yPos += 5;
  doc.setFontSize(smallSize);
  doc.text("Please come again soon!", xCenter, yPos, { align: "center" });
  
  return doc;
};

/**
 * Generate Products Template for Excel Import
 */
export const generateProductsTemplate = () => {
  const headers = ["name", "price", "category", "description", "barcode", "inStock", "storeId", "image"];
  const sampleProduct = {
    name: "Sample Product",
    price: 9.99,
    category: "electronics",
    description: "Sample description",
    barcode: "123456789",
    inStock: 100,
    storeId: "store-1",
    image: "https://example.com/image.jpg"
  };
  
  return { headers, data: [Object.values(sampleProduct)] };
};

/**
 * Generate Customers Template for Excel Import
 */
export const generateCustomersTemplate = () => {
  const headers = ["name", "email", "phone", "address", "notes"];
  const sampleCustomer = {
    name: "John Doe",
    email: "john@example.com", 
    phone: "555-123-4567",
    address: "123 Main St, Anytown",
    notes: "Sample customer notes"
  };
  
  return { headers, data: [Object.values(sampleCustomer)] };
};
