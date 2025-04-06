
import React, { useState, useEffect } from "react";
import { Check, CreditCard, DollarSign, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CartItem, paymentMethods, customers, settings } from "@/utils/data";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onConfirm: () => void;
  customerId?: string;
  storeId?: string;
}

const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  onConfirm,
  customerId,
  storeId
}) => {
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    logo: "",
    address: "",
    phone: "",
    taxRate: 10 // Default tax rate
  });

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
    doc.text(`Payment: ${paymentMethods.find(p => p.id === selectedPayment)?.name || selectedPayment}`, 5, yPos);
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
        
        // Close the checkout dialog after successful payment
        onClose();
      } catch (error) {
        console.error("Error during order confirmation:", error);
      }
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>Complete your payment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({companyInfo.taxRate}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start transition-smooth",
                    selectedPayment === method.id && "border-primary/50 bg-primary/5"
                  )}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  {method.id === "cash" ? (
                    <DollarSign className="mr-2 h-4 w-4" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  {method.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Pay ${total.toFixed(2)}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Checkout;
