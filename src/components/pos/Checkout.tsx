
import React, { useState, useEffect } from "react";
import { CartItem, paymentMethods, customers, settings } from "@/utils/data";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onConfirm: () => void;
  customerId?: string;
  storeId?: string;
  selectedPaymentMethod: string;
}

const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  onConfirm,
  customerId,
  storeId,
  selectedPaymentMethod
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    logo: "",
    address: "",
    phone: "",
    taxRate: 10 // Default tax rate
  });

  useEffect(() => {
    if (isOpen) {
      handleConfirm();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load company information from settings
    const storeName = settings.find(s => s.name === "Store Name")?.value || "My POS Store";
    const storeLogo = settings.find(s => s.name === "Store Logo")?.value || "";
    const storeAddress = settings.find(s => s.name === "Store Address")?.value || "";
    const storePhone = settings.find(s => s.name === "Store Phone")?.value || "";
    
    // Get tax rate for specific store if available
    let taxRate = 10; // Default 10%
    
    if (storeId) {
      // Try to find store-specific tax
      const storeTaxSetting = settings.find(
        s => s.name === `Tax Rate-${storeId}` && s.category === "tax"
      );
      if (storeTaxSetting) {
        taxRate = parseFloat(storeTaxSetting.value);
      }
    }

    setCompanyInfo({
      name: storeName,
      logo: storeLogo,
      address: storeAddress,
      phone: storePhone,
      taxRate: taxRate
    });
  }, [storeId]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (companyInfo.taxRate / 100); // Using the loaded tax rate
  const total = subtotal + tax;

  const generateReceipt = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Standard thermal receipt width (80mm) with adjustable height
    });
    
    const currentDate = new Date().toLocaleString();
    let yPos = 10;
    
    // Add company logo if available
    if (companyInfo.logo) {
      try {
        doc.addImage(companyInfo.logo, 'JPEG', 20, yPos, 40, 20);
        yPos += 22;
      } catch (e) {
        console.error("Error adding logo to receipt:", e);
      }
    }
    
    // Add receipt header with company info
    doc.setFontSize(12);
    doc.text(companyInfo.name, 40, yPos, { align: "center" });
    yPos += 5;
    
    doc.setFontSize(8);
    if (companyInfo.address) {
      doc.text(companyInfo.address, 40, yPos, { align: "center" });
      yPos += 4;
    }
    
    if (companyInfo.phone) {
      doc.text(`Tel: ${companyInfo.phone}`, 40, yPos, { align: "center" });
      yPos += 4;
    }
    
    // Add divider
    doc.setDrawColor(0);
    doc.line(5, yPos, 75, yPos);
    yPos += 5;
    
    // Add receipt info
    doc.setFontSize(9);
    doc.text(`Date: ${currentDate}`, 5, yPos);
    yPos += 4;
    doc.text(`Payment: ${paymentMethods.find(p => p.id === selectedPaymentMethod)?.name || selectedPaymentMethod}`, 5, yPos);
    yPos += 4;
    doc.text(`Receipt #: ${Math.floor(Math.random() * 10000)}`, 5, yPos);
    yPos += 6;
    
    // Add customer info if available
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        doc.text(`Customer: ${customer.name}`, 5, yPos);
        yPos += 4;
        if (customer.totalSpent) {
          doc.text(`Balance: $${customer.totalSpent.toFixed(2)}`, 5, yPos);
          yPos += 4;
        }
      }
    }
    
    // Add divider
    doc.setDrawColor(0);
    doc.line(5, yPos, 75, yPos);
    yPos += 5;
    
    // Create table with items
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = items.map(item => [
      item.name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    // Add the table to the PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 15, halign: 'right' },
        3: { cellWidth: 15, halign: 'right' }
      },
      margin: { left: 5, right: 5 }
    });
    
    // Calculate the height of the table we just added
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    
    // Add totals
    let totalsY = finalY + 5;
    doc.text(`Subtotal:`, 45, totalsY);
    doc.text(`$${subtotal.toFixed(2)}`, 75, totalsY, { align: "right" });
    totalsY += 4;
    
    doc.text(`Tax (${companyInfo.taxRate}%):`, 45, totalsY);
    doc.text(`$${tax.toFixed(2)}`, 75, totalsY, { align: "right" });
    totalsY += 4;
    
    doc.setFont(undefined, 'bold');
    doc.text(`Total:`, 45, totalsY);
    doc.text(`$${total.toFixed(2)}`, 75, totalsY, { align: "right" });
    doc.setFont(undefined, 'normal');
    totalsY += 10;
    
    // Add footer
    doc.text("Thank you for your purchase!", 40, totalsY, { align: "center" });
    
    // Save the PDF
    doc.save("receipt.pdf");
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      try {
        // Generate and download receipt
        generateReceipt();
        
        // Call onConfirm to clear the cart and start a new order
        onConfirm();
        
        // Close the checkout process
        onClose();
      } catch (error) {
        console.error("Error during order confirmation:", error);
      }
    }, 1000);
  };

  return null; // No UI is rendered, everything happens programmatically
};

export default Checkout;
