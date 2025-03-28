
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, paymentMethods, stores } from "../data";
import "../pdf/pdfTypes";

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
    margin: { left: xLeft, right: 5 }
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
