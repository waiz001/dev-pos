
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addOrder, products, orders, customers, paymentMethods } from "@/utils/data";
import { toast } from "sonner";
import { Printer, RotateCcw } from "lucide-react";
import ProductGrid from "@/components/pos/ProductGrid";
import AddProductButton from "@/components/forms/AddProductButton";
import RecoveryForm from "@/components/pos/RecoveryForm";

const POSSession = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("guest");
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  
  // Fix: Add safety check for product filtering
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const addToCart = (product) => {
    if (!product) return;
    
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    const selectedCustomer = selectedCustomerId !== "guest" 
      ? customers.find(c => c.id === selectedCustomerId) 
      : null;
    
    const newOrder = {
      items: [...cart],
      total: calculateTotal(),
      tax: 0, // Tax removed as per requirement
      status: "completed" as "completed" | "pending" | "cancelled", // Fix for TypeScript error
      date: new Date(),
      customerId: selectedCustomer?.id || "",
      customerName: selectedCustomer?.name || "Walk-in Customer",
      paymentMethod: "cash",
    };
    
    try {
      const order = addOrder(newOrder);
      setLastOrderId(order.id);
      toast.success("Order completed successfully");
      
      // Open print dialog automatically
      setIsPrintDialogOpen(true);
      
      // Reset cart and selected customer
      setCart([]);
      setSelectedCustomerId("guest");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to complete order");
    }
  };

  const printOrderSlips = () => {
    if (!lastOrderId) {
      toast.error("No recent order to print");
      return;
    }
    
    const orderToPrint = orders.find(o => o.id === lastOrderId);
    if (!orderToPrint) {
      toast.error("Order not found");
      return;
    }
    
    // In a real app, you would use a library like react-to-print or send to a backend
    // For demonstration, we'll just prepare the print content and show it in a new window
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      const printContent = `
        <html>
          <head>
            <title>Order Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
              .receipt { border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
              h2 { margin-bottom: 10px; }
              .header { text-align: center; margin-bottom: 20px; }
              .items { margin: 15px 0; }
              .item { margin-bottom: 5px; }
              .total { font-weight: bold; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 10px; }
              .footer { margin-top: 15px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <!-- First Copy - For Customer -->
            <div class="receipt">
              <div class="header">
                <h2>POS System</h2>
                <p>Order #${orderToPrint.id.split('-')[1]}</p>
                <p>Date: ${new Date(orderToPrint.date).toLocaleString()}</p>
                <p>Customer: ${orderToPrint.customerName}</p>
              </div>
              <div class="items">
                <p><strong>Items:</strong></p>
                ${orderToPrint.items.map(item => `
                  <div class="item">
                    ${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
                  </div>
                `).join('')}
              </div>
              <div class="total">
                <p>Total: $${orderToPrint.total.toFixed(2)}</p>
              </div>
              <div class="footer">
                <p>Thank you for your purchase!</p>
                <p>CUSTOMER COPY</p>
              </div>
            </div>
            
            <!-- Second Copy - For Merchant -->
            <div class="receipt">
              <div class="header">
                <h2>POS System</h2>
                <p>Order #${orderToPrint.id.split('-')[1]}</p>
                <p>Date: ${new Date(orderToPrint.date).toLocaleString()}</p>
                <p>Customer: ${orderToPrint.customerName}</p>
              </div>
              <div class="items">
                <p><strong>Items:</strong></p>
                ${orderToPrint.items.map(item => `
                  <div class="item">
                    ${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
                  </div>
                `).join('')}
              </div>
              <div class="total">
                <p>Total: $${orderToPrint.total.toFixed(2)}</p>
              </div>
              <div class="footer">
                <p>Thank you for your purchase!</p>
                <p>MERCHANT COPY</p>
              </div>
            </div>
            
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      toast.error("Unable to open print window. Please check your popup settings.");
    }
    
    setIsPrintDialogOpen(false);
  };

  // Fix: Using a useEffect to ensure the todayOrders calculation is correct
  const [todayOrders, setTodayOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (Array.isArray(orders)) {
      const today = new Date().toDateString();
      const filteredOrders = orders.filter(
        (order) => new Date(order.date).toDateString() === today
      );
      setTodayOrders(filteredOrders);
      setTotalSales(filteredOrders.reduce((total, order) => total + order.total, 0));
    } else {
      setTodayOrders([]);
      setTotalSales(0);
    }
  }, [orders]);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">POS Session</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg">
              Today's Sales: ${totalSales.toFixed(2)}
            </Badge>
            <Button variant="outline" onClick={() => setIsRecoveryDialogOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Recovery
            </Button>
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
              <Printer className="mr-2 h-4 w-4" />
              Print Last Order
            </Button>
            <Button onClick={() => navigate("/")}>Close Session</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Products */}
          <div className="col-span-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>Products</CardTitle>
                  <AddProductButton />
                </div>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-sm"
                />
              </CardHeader>
              <CardContent>
                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={addToCart}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Cart</CardTitle>
              </CardHeader>
              <CardContent className="flex h-[calc(100%-64px)] flex-col">
                <div className="mb-4">
                  <label htmlFor="customer" className="block text-sm font-medium mb-1">
                    Customer (Optional)
                  </label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Walk-in Customer</SelectItem>
                      {Array.isArray(customers) && customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {cart.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-center text-muted-foreground">
                        Cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 border-b pb-2"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                            >
                              X
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                  >
                    Complete Sale
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recovery Dialog */}
      <Dialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Recovery</DialogTitle>
          </DialogHeader>
          <RecoveryForm onSuccess={() => setIsRecoveryDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Print Order Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you ready to print the receipt for this order?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This will print two copies of the receipt - one for the customer and one for your records.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={printOrderSlips}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default POSSession;
