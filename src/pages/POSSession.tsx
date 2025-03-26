
import React, { useState, useEffect, useRef } from "react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { addOrder, products, orders, customers, paymentMethods, updateOrder, Order } from "@/utils/data";
import { toast } from "sonner";
import { FileDown, FileUp, Printer, RotateCcw, ListOrdered, PlusCircle } from "lucide-react";
import ProductGrid from "@/components/pos/ProductGrid";
import AddProductButton from "@/components/forms/AddProductButton";
import RecoveryForm from "@/components/pos/RecoveryForm";
import AllOrdersDialog from "@/components/pos/AllOrdersDialog";
import { generateDailySalesReportPDF, generateOrderReceiptPDF } from "@/utils/pdfUtils";
import PDFViewer from "@/components/reports/PDFViewer";

const POSSession = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("guest");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isAllOrdersDialogOpen, setIsAllOrdersDialogOpen] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const addToCart = (product: any) => {
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

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
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

  const calculateTax = () => {
    return calculateTotal() * 0.1;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        position: "bottom-center"
      });
      return;
    }
    
    const selectedCustomer = selectedCustomerId !== "guest" 
      ? customers.find(c => c.id === selectedCustomerId) 
      : null;
    
    const orderData = {
      items: [...cart],
      total: calculateTotal(),
      tax: calculateTax(),
      status: "completed" as "completed" | "pending" | "cancelled" | "in-progress",
      date: new Date(),
      customerId: selectedCustomer?.id || "",
      customerName: selectedCustomer?.name || "Walk-in Customer",
      paymentMethod: selectedPaymentMethod,
    };
    
    try {
      if (currentOrderId) {
        const updatedOrder = updateOrder(currentOrderId, {
          ...orderData,
          status: "completed"
        });
        
        if (updatedOrder) {
          setLastOrderId(updatedOrder.id);
          
          const customerReceipt = generateOrderReceiptPDF(updatedOrder);
          setPdfDocument(customerReceipt);
          customerReceipt.save("customer_receipt.pdf");
          
          const merchantReceipt = generateOrderReceiptPDF({
            ...updatedOrder,
            isMerchantCopy: true
          });
          merchantReceipt.save("merchant_receipt.pdf");
          
          // Reset cart and start a new order after successful completion
          resetCart();
          
          toast.success("Order completed and receipts downloaded", {
            position: "bottom-center"
          });
        } else {
          toast.error("Failed to update order", {
            position: "bottom-center"
          });
        }
      } else {
        const order = addOrder(orderData);
        setLastOrderId(order.id);
        
        const customerReceipt = generateOrderReceiptPDF(order);
        setPdfDocument(customerReceipt);
        customerReceipt.save("customer_receipt.pdf");
        
        const merchantReceipt = generateOrderReceiptPDF({
          ...order,
          isMerchantCopy: true
        });
        merchantReceipt.save("merchant_receipt.pdf");
        
        // Reset cart and start a new order after successful completion
        resetCart();
        
        toast.success("Order completed and receipts downloaded", {
          position: "bottom-center"
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to complete order", {
        position: "bottom-center"
      });
    }
  };

  const saveOrderInProgress = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        position: "bottom-center"
      });
      return false;
    }
    
    const selectedCustomer = selectedCustomerId !== "guest" 
      ? customers.find(c => c.id === selectedCustomerId) 
      : null;
    
    try {
      const order = addOrder({
        items: [...cart],
        total: calculateTotal(),
        tax: calculateTax(),
        status: "in-progress" as "completed" | "pending" | "cancelled" | "in-progress",
        date: new Date(),
        customerId: selectedCustomer?.id || "",
        customerName: selectedCustomer?.name || "Walk-in Customer",
        paymentMethod: selectedPaymentMethod,
      });
      
      toast.success("Order saved as in-progress", {
        position: "bottom-center"
      });
      return true;
    } catch (error) {
      console.error("Error saving in-progress order:", error);
      toast.error("Failed to save order", {
        position: "bottom-center"
      });
      return false;
    }
  };

  const handleNewOrder = () => {
    if (cart.length > 0) {
      setIsNewOrderDialogOpen(true);
    } else {
      resetCart();
    }
  };

  const confirmNewOrder = () => {
    if (saveOrderInProgress()) {
      resetCart();
      setIsNewOrderDialogOpen(false);
    }
  };

  const resetCart = () => {
    setCart([]);
    setCurrentOrderId(null);
    setSelectedCustomerId("guest");
    setSelectedPaymentMethod("cash");
  };

  const loadOrder = (order: Order) => {
    setCart(order.items);
    setSelectedCustomerId(order.customerId || "guest");
    setSelectedPaymentMethod(order.paymentMethod);
    setCurrentOrderId(order.id);
    toast.info(`Order ${order.id} loaded`);
  };

  const generateReceipt = (order?: Order) => {
    if (!order && !lastOrderId) {
      toast.error("No order to print", {
        position: "bottom-center"
      });
      return;
    }
    
    const orderToPrint = order || orders.find(o => o.id === lastOrderId);
    if (!orderToPrint) {
      toast.error("Order not found", {
        position: "bottom-center"
      });
      return;
    }
    
    try {
      const customerReceipt = generateOrderReceiptPDF(orderToPrint);
      setPdfDocument(customerReceipt);
      customerReceipt.save("customer_receipt.pdf");
      
      const merchantReceipt = generateOrderReceiptPDF({
        ...orderToPrint,
        isMerchantCopy: true
      });
      merchantReceipt.save("merchant_receipt.pdf");
      
      setIsPrintDialogOpen(true);
      
      toast.success("Receipts downloaded successfully", {
        position: "bottom-center"
      });
    } catch (error) {
      console.error("Error generating receipts:", error);
      toast.error("Failed to generate receipts. Please try again.", {
        position: "bottom-center"
      });
    }
  };
  
  const printSlip = () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart first", {
        position: "bottom-center"
      });
      return;
    }
    
    const selectedCustomer = selectedCustomerId !== "guest" 
      ? customers.find(c => c.id === selectedCustomerId) 
      : null;
    
    const tempOrder = {
      id: "preview-" + Date.now(),
      date: new Date(),
      items: [...cart],
      total: calculateTotal(),
      tax: calculateTax(),
      customerName: selectedCustomer?.name || "Walk-in Customer",
      paymentMethod: selectedPaymentMethod,
      status: "pending" as "pending" | "completed" | "cancelled" | "in-progress",
    };
    
    try {
      const customerReceipt = generateOrderReceiptPDF(tempOrder);
      setPdfDocument(customerReceipt);
      customerReceipt.save("customer_receipt.pdf");
      
      const merchantReceipt = generateOrderReceiptPDF({
        ...tempOrder,
        isMerchantCopy: true
      });
      merchantReceipt.save("merchant_receipt.pdf");
      
      setIsPrintDialogOpen(true);
      
      toast.success("Receipts downloaded successfully", {
        position: "bottom-center"
      });
    } catch (error) {
      console.error("Error printing slip:", error);
      toast.error("Failed to generate receipts. Please try again.", {
        position: "bottom-center"
      });
    }
  };

  const generateDailySalesReport = () => {
    const today = new Date().toDateString();
    const todaysOrders = orders.filter(
      (order) => new Date(order.date).toDateString() === today
    );
    
    if (todaysOrders.length === 0) {
      toast.error("No sales recorded today");
      return;
    }
    
    try {
      const reportPdf = generateDailySalesReportPDF(todaysOrders);
      
      reportPdf.save("daily_sales_report.pdf");
      
      toast.success("Sales report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report", {
        position: "bottom-center"
      });
    }
  };
  
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
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsRecoveryDialogOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Recovery
              </Button>
              
              <Button variant="outline" onClick={() => setIsAllOrdersDialogOpen(true)}>
                <ListOrdered className="mr-2 h-4 w-4" />
                All Orders
              </Button>
              
              <Button variant="outline" onClick={() => { 
                if (lastOrderId) {
                  generateReceipt();
                  setIsPrintDialogOpen(true);
                } else {
                  toast.error("No recent order to print");
                }
              }}>
                <Printer className="mr-2 h-4 w-4" />
                Print Last Order
              </Button>
              
              <Button variant="outline" onClick={generateDailySalesReport}>
                <FileDown className="mr-2 h-4 w-4" />
                Daily Report
              </Button>
            </div>
            
            <Button onClick={() => navigate("/")}>Close Session</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
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

          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {currentOrderId ? `Editing Order: ${currentOrderId}` : "New Order"}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleNewOrder}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </CardHeader>
              <CardContent className="flex h-[calc(100%-84px)] flex-col">
                <div className="mb-4 space-y-4">
                  <div>
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
                  
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">
                      Payment Method
                    </label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(paymentMethods) && paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <div className="flex gap-2">
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={printSlip}
                      disabled={cart.length === 0}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Slip
                    </Button>
                    <Button
                      className="mt-4 flex-1"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      Complete Sale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Recovery</DialogTitle>
          </DialogHeader>
          <RecoveryForm onSuccess={() => setIsRecoveryDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <PDFViewer
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        pdfDocument={pdfDocument}
        title="Order Receipt"
        filename="receipt.pdf"
      />
      
      <PDFViewer
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        pdfDocument={pdfDocument}
        title="Daily Sales Report"
        filename="daily_sales_report.pdf"
      />
      
      <AllOrdersDialog
        open={isAllOrdersDialogOpen}
        onOpenChange={setIsAllOrdersDialogOpen}
        onSelectOrder={loadOrder}
      />
      
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start New Order</DialogTitle>
            <DialogDescription>
              You have items in your current order. What would you like to do with them?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Your current order will be saved as "In Progress" and can be resumed later.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmNewOrder}>
              Save and Start New Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default POSSession;
