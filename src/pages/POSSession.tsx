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
} from "@/components/ui/dialog";
import { addOrder, products, orders, customers, paymentMethods } from "@/utils/data";
import { toast } from "sonner";
import { FileDown, FileUp, Printer, RotateCcw } from "lucide-react";
import ProductGrid from "@/components/pos/ProductGrid";
import AddProductButton from "@/components/forms/AddProductButton";
import RecoveryForm from "@/components/pos/RecoveryForm";
import { generateDailySalesReportPDF, generateOrderReceiptPDF } from "@/utils/pdfUtils";
import PDFViewer from "@/components/reports/PDFViewer";
import { downloadCustomersTemplate, downloadProductsTemplate, exportCustomersToExcel, exportProductsToExcel } from "@/utils/excelUtils";
import ImportExcelDialog from "@/components/import-export/ImportExcelDialog";

const POSSession = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("guest");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isImportProductsDialogOpen, setIsImportProductsDialogOpen] = useState(false);
  const [isImportCustomersDialogOpen, setIsImportCustomersDialogOpen] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  
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

  const calculateTax = () => {
    return calculateTotal() * 0.1;
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
      tax: calculateTax(),
      status: "completed" as "completed" | "pending" | "cancelled",
      date: new Date(),
      customerId: selectedCustomer?.id || "",
      customerName: selectedCustomer?.name || "Walk-in Customer",
      paymentMethod: selectedPaymentMethod,
    };
    
    try {
      const order = addOrder(newOrder);
      setLastOrderId(order.id);
      toast.success("Order completed successfully");
      
      generateReceipt(order);
      setIsPrintDialogOpen(true);
      
      setCart([]);
      setSelectedCustomerId("guest");
      setSelectedPaymentMethod("cash");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to complete order");
    }
  };

  const generateReceipt = (order?) => {
    if (!order && !lastOrderId) {
      toast.error("No order to print");
      return;
    }
    
    const orderToPrint = order || orders.find(o => o.id === lastOrderId);
    if (!orderToPrint) {
      toast.error("Order not found");
      return;
    }
    
    const pdfDoc = generateOrderReceiptPDF(orderToPrint);
    setPdfDocument(pdfDoc);
  };
  
  const printSlip = () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart first");
      return;
    }
    
    const selectedCustomer = selectedCustomerId !== "guest"
      ? customers.find(c => c.id === selectedCustomerId) 
      : null;
      
    const tempOrder = {
      id: "preview-" + Date.now(),
      date: new Date(),
      items: cart,
      total: calculateTotal(),
      tax: calculateTax(),
      customerName: selectedCustomer?.name || "Walk-in Customer",
      paymentMethod: selectedPaymentMethod,
      status: "pending" as "pending" | "completed" | "cancelled",
    };
    
    const pdfDoc = generateOrderReceiptPDF(tempOrder);
    setPdfDocument(pdfDoc);
    setIsPrintDialogOpen(true);
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
    
    const pdfDoc = generateDailySalesReportPDF(todaysOrders);
    setPdfDocument(pdfDoc);
    setIsReportDialogOpen(true);
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

  const handleImportProducts = () => {
    setIsImportProductsDialogOpen(true);
  };

  const handleImportCustomers = () => {
    setIsImportCustomersDialogOpen(true);
  };

  const handleExportProducts = () => {
    exportProductsToExcel();
    toast.success("Products exported to Excel");
  };

  const handleExportCustomers = () => {
    exportCustomersToExcel();
    toast.success("Customers exported to Excel");
  };

  const handleProductTemplateDownload = () => {
    downloadProductsTemplate();
    toast.success("Product template downloaded");
  };

  const handleCustomerTemplateDownload = () => {
    downloadCustomersTemplate();
    toast.success("Customer template downloaded");
  };

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

        <div className="flex flex-wrap gap-6 mb-6">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleProductTemplateDownload}>
              Download Products Template
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportProducts}>
              <FileUp className="mr-2 h-4 w-4" />
              Import Products
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportProducts}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Products
            </Button>
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleCustomerTemplateDownload}>
              Download Customers Template
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportCustomers}>
              <FileUp className="mr-2 h-4 w-4" />
              Import Customers
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCustomers}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Customers
            </Button>
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
              <CardHeader>
                <CardTitle>Cart</CardTitle>
              </CardHeader>
              <CardContent className="flex h-[calc(100%-64px)] flex-col">
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
      
      <ImportExcelDialog
        open={isImportProductsDialogOpen}
        onOpenChange={setIsImportProductsDialogOpen}
        type="products"
        onImportComplete={() => {
          setIsImportProductsDialogOpen(false);
          setSearchQuery("");
        }}
      />
      
      <ImportExcelDialog
        open={isImportCustomersDialogOpen}
        onOpenChange={setIsImportCustomersDialogOpen}
        type="customers"
        onImportComplete={() => {
          setIsImportCustomersDialogOpen(false);
        }}
      />
    </MainLayout>
  );
};

export default POSSession;
