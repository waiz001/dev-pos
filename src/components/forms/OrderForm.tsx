
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Order, Customer, CartItem, products, customers, paymentMethods, updateCustomer } from "@/utils/data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const orderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSubmit: (data: OrderFormValues & { items: CartItem[], total: number }) => void;
  initialData?: Partial<Order>;
  buttonText?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  initialData = {},
  buttonText = "Save Order",
}) => {
  const [cart, setCart] = useState<CartItem[]>(initialData.items || []);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: initialData.customerId || "",
      customerName: initialData.customerName || "",
      paymentMethod: initialData.paymentMethod || "cash",
      notes: initialData.notes || "",
    },
  });

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
    // Calculate tax as 10% of the total
    return calculateTotal() * 0.1;
  };

  const handleSubmit = (values: OrderFormValues) => {
    if (cart.length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }

    const selectedCustomer = customers.find(c => c.id === values.customerId);
    const total = calculateTotal();

    // Update customer balance if using credit payment method
    if (values.paymentMethod === "credit-card" && selectedCustomer) {
      // Add to customer's balance (totalSpent)
      const currentBalance = selectedCustomer.totalSpent || 0;
      const newBalance = currentBalance + total;
      
      updateCustomer(selectedCustomer.id, {
        totalSpent: newBalance
      });
      
      // Dispatch the custom event to notify other components about the customer update
      window.dispatchEvent(new CustomEvent('customer-updated'));
      
      toast.success(`Added $${total.toFixed(2)} to ${selectedCustomer.name}'s balance`);
    }

    onSubmit({
      ...values,
      items: cart,
      total: total,
      customerName: selectedCustomer?.name || values.customerName || "Guest",
    });
    
    // Reset the form and cart after successful submission
    form.reset({
      customerId: "",
      customerName: "",
      paymentMethod: "cash",
      notes: "",
    });
    setCart([]);
    setSearchQuery("");
    
    toast.success("Order saved successfully");
  };

  // Watch the customerId and paymentMethod for conditional rendering
  const watchedCustomerId = form.watch("customerId");
  const watchedPaymentMethod = form.watch("paymentMethod");
  const selectedCustomer = customers.find(c => c.id === watchedCustomerId);
  const isCreditPayment = watchedPaymentMethod === "credit-card";
  const currentBalance = selectedCustomer?.totalSpent || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="guest">Walk-in Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.totalSpent > 0 ? `(Balance: $${customer.totalSpent.toFixed(2)})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedCustomer && isCreditPayment && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Customer Current Balance: ${currentBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">New balance after this order: ${(currentBalance + calculateTotal()).toFixed(2)}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4">
              <h3 className="text-lg font-medium">Products</h3>
              <div className="mt-2">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addToCart(product.id)}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <h3 className="text-lg font-medium">Cart</h3>
              <div className="mt-2">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground">Cart is empty</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Any additional information" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">{buttonText}</Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderForm;
