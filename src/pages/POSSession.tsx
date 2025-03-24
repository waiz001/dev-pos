
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addOrder, products, orders, type CartItem, type Order } from "@/utils/data";
import { toast } from "sonner";

const POSSession = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === productId
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
    return calculateTotal() * 0.1; // 10% tax
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    const newOrder: Omit<Order, "id"> = {
      items: [...cart],
      total: calculateTotal() + calculateTax(),
      tax: calculateTax(),
      status: "completed",
      date: new Date(),
      customerName: "Walk-in Customer",
      paymentMethod: "cash",
    };
    
    addOrder(newOrder);
    toast.success("Order completed successfully");
    setCart([]);
  };

  const todayOrders = orders.filter(
    (order) => 
      new Date(order.date).toDateString() === new Date().toDateString()
  );

  const totalSales = todayOrders.reduce((total, order) => total + order.total, 0);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">POS Session</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg">
              Today's Sales: ${totalSales.toFixed(2)}
            </Badge>
            <Button onClick={() => navigate("/")}>Close Session</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Products */}
          <div className="col-span-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-sm"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="cursor-pointer overflow-hidden"
                      onClick={() => addToCart(product.id)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.inStock}
                          </p>
                          <p className="font-semibold">${product.price.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(calculateTotal() + calculateTax()).toFixed(2)}</span>
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
    </MainLayout>
  );
};

export default POSSession;
