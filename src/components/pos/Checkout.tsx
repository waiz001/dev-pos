
import React, { useState } from "react";
import { Check, CreditCard, DollarSign, X, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CartItem, paymentMethods } from "@/utils/data";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onConfirm: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  onConfirm,
}) => {
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const generateReceipt = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    
    // Add receipt header
    doc.setFontSize(20);
    doc.text("Sales Receipt", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 20, 30);
    doc.text(`Payment Method: ${paymentMethods.find(p => p.id === selectedPayment)?.name || selectedPayment}`, 20, 35);
    doc.text(`Receipt #: ${Math.floor(Math.random() * 10000)}`, 20, 40);
    
    // Create table with items
    const tableColumn = ["Item", "Price", "Qty", "Total"];
    const tableRows = items.map(item => [
      item.name,
      `$${item.price.toFixed(2)}`,
      item.quantity,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    // Add the table to the PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
    });
    
    // Calculate the height of the table we just added
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    // Add totals
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 150, finalY + 10, { align: "right" });
    doc.text(`Tax (10%): $${tax.toFixed(2)}`, 150, finalY + 15, { align: "right" });
    doc.text(`Total: $${total.toFixed(2)}`, 150, finalY + 25, { align: "right" });
    
    // Add footer
    doc.text("Thank you for your purchase!", 105, finalY + 40, { align: "center" });
    
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
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>Complete your purchase</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="mb-2 font-medium">Order Summary</h3>
            <div className="max-h-64 space-y-2 overflow-auto rounded-md border p-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
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
