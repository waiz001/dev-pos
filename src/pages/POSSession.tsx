import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addOrder, products, orders, customers, paymentMethods, updateOrder, Order, stores, updateCustomer } from "@/utils/data";
import { RotateCcw, ListOrdered, LogOut } from "lucide-react";
import ProductGrid from "@/components/pos/ProductGrid";
import AddProductButton from "@/components/forms/AddProductButton";
import RecoveryForm from "@/components/pos/RecoveryForm";
import AllOrdersDialog from "@/components/pos/AllOrdersDialog";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import Checkout from "@/components/pos/Checkout";

const POSSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("guest");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isAllOrdersDialogOpen, setIsAllOrdersDialogOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [isClosePOSDialogOpen, setIsClosePOSDialogOpen] = useState(false);
  const [closePOSPassword, setClosePOSPassword] = useState("");
  const { currentUser, logout } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const storeId = params.get('storeId');
    if (storeId) {
      setCurrentStoreId(storeId);
    }
  }, [location]);
  
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStore = !currentStoreId || !product.storeId || product.storeId === currentStoreId;
        return matchesSearch && matchesStore;
      })
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

  const resetCart = () => {
    setCart([]);
    setCurrentOrderId(null);
    setSelectedCustomerId("guest");
    setSelectedPaymentMethod("cash");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
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
      storeId: currentStoreId || ""
    };
    
    try {
      if (selectedPaymentMethod === "credit-card" && selectedCustomer) {
        const currentBalance = selectedCustomer.totalSpent || 0;
        const newBalance = currentBalance + calculateTotal();
        
        updateCustomer(selectedCustomer.id, {
          totalSpent: newBalance
        });
        
        window.dispatchEvent(new CustomEvent('customer-updated'));
      }
      
      if (currentOrderId) {
        const updatedOrder = updateOrder(currentOrderId, {
          ...orderData,
          status: "completed"
        });
        
        if (updatedOrder) {
          setLastOrderId(updatedOrder.id);
          resetCart();
        }
      } else {
        const order = addOrder(orderData);
        setLastOrderId(order.id);
        resetCart();
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const loadOrder = (order: Order) => {
    setCart(order.items);
    setSelectedCustomerId(order.customerId || "guest");
    setSelectedPaymentMethod(order.paymentMethod);
    setCurrentOrderId(order.id);
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

  const currentStore = currentStoreId 
    ? stores.find(store => store.id === currentStoreId) 
    : null;
  
  const currentStoreName = currentStore?.name || "Unknown Store";

  const selectedCustomer = selectedCustomerId !== "guest" 
    ? customers.find(c => c.id === selectedCustomerId) 
    : null;
  const customerBalance = selectedCustomer?.totalSpent || 0;

  const handleClosePOS = () => {
    setIsClosePOSDialogOpen(true);
  };

  const confirmClosePOS = () => {
    if (currentUser && closePOSPassword) {
      navigate("/pos-shop");
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">POS Session</h1>
            <p className="text-muted-foreground">Store: {currentStoreName}</p>
            {currentUser && (
              <p className="text-muted-foreground">Cashier: {currentUser.name}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Badge variant="outline" className="text-lg">
              Today's Sales: ${totalSales.toFixed(2)}
            </Badge>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setIsRecoveryDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Recovery
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setIsAllOrdersDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <ListOrdered className="mr-2 h-4 w-4" />
                All Orders
              </Button>
            </div>
            
            <Button 
              onClick={handleClosePOS}
              className="w-full sm:w-auto"
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Close POS
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="col-span-12 md:col-span-8">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                  <CardTitle>Products</CardTitle>
                  <div className="w-full sm:w-auto">
                    <AddProductButton />
                  </div>
                </div>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-sm"
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

          <div className="col-span-12 md:col-span-4">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {currentOrderId ? `Editing Order: ${currentOrderId}` : "Current Order"}
                </CardTitle>
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
                            {customer.name} {customer.totalSpent > 0 ? `(Balance: $${customer.totalSpent.toFixed(2)})` : ''}
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

                  {selectedCustomer && selectedPaymentMethod === "credit-card" && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Customer Current Balance: ${customerBalance.toFixed(2)}</p>
                      {calculateTotal() > 0 && (
                        <p className="text-sm text-muted-foreground">
                          New balance after this order: ${(customerBalance + calculateTotal()).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
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
                      className="mt-4 flex-1"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      Pay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onConfirm={handleCheckoutComplete}
        customerId={selectedCustomerId !== "guest" ? selectedCustomerId : undefined}
        storeId={currentStoreId || undefined}
      />

      <Dialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] h-auto">
          <DialogHeader>
            <DialogTitle>Payment Recovery</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-130px)]">
            <RecoveryForm onSuccess={() => setIsRecoveryDialogOpen(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AllOrdersDialog
        open={isAllOrdersDialogOpen}
        onOpenChange={setIsAllOrdersDialogOpen}
        onSelectOrder={loadOrder}
      />

      <Dialog open={isClosePOSDialogOpen} onOpenChange={setIsClosePOSDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Close POS Session</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p>Please enter your password to close this POS session:</p>
            <div className="space-y-2">
              <Label htmlFor="close-password">Password</Label>
              <Input 
                id="close-password" 
                type="password" 
                value={closePOSPassword}
                onChange={(e) => setClosePOSPassword(e.target.value)}
                className="py-6"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClosePOSDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmClosePOS}>
              Close POS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default POSSession;
