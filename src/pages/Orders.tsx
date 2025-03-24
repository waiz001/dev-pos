
import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Search, Calendar, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { 
  orders, 
  products,
  customers,
  paymentMethods,
  addOrder, 
  updateOrder, 
  deleteOrder, 
  Order,
  CartItem
} from "@/utils/data";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500"
};

const Orders = () => {
  const [ordersList, setOrdersList] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  
  const addForm = useForm<Omit<Order, "id">>({
    defaultValues: {
      items: [],
      total: 0,
      tax: 0,
      status: "pending",
      date: new Date(),
      paymentMethod: "cash"
    }
  });
  
  const editForm = useForm<Order>({
    defaultValues: selectedOrder || {
      id: "",
      items: [],
      total: 0,
      tax: 0,
      status: "pending",
      date: new Date(),
      paymentMethod: "cash"
    }
  });
  
  // Update edit form when selected order changes
  React.useEffect(() => {
    if (selectedOrder) {
      editForm.reset(selectedOrder);
      setOrderItems(selectedOrder.items);
    }
  }, [selectedOrder, editForm]);
  
  const handleSearch = () => {
    if (!searchQuery) {
      setOrdersList(orders);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(order => 
      order.id.toLowerCase().includes(query) || 
      order.customerName?.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
    
    setOrdersList(filtered);
  };
  
  // Search orders when query changes
  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, orders]);
  
  const handleAddOrder = (data: Omit<Order, "id">) => {
    try {
      const newOrder = addOrder({
        ...data,
        items: orderItems,
        total: calculateTotal(orderItems),
        tax: calculateTax(orderItems)
      });
      setOrdersList([...orders]);
      toast.success(`Order created successfully`);
      setIsAddDialogOpen(false);
      addForm.reset();
      setOrderItems([]);
    } catch (error) {
      toast.error("Failed to create order");
      console.error(error);
    }
  };
  
  const handleEditOrder = (data: Order) => {
    if (!selectedOrder) return;
    
    try {
      const updated = updateOrder(selectedOrder.id, {
        ...data,
        items: orderItems,
        total: calculateTotal(orderItems),
        tax: calculateTax(orderItems)
      });
      
      if (updated) {
        setOrdersList([...orders]);
        toast.success(`Order updated successfully`);
        setIsEditDialogOpen(false);
        setSelectedOrder(null);
        setOrderItems([]);
      } else {
        toast.error("Order not found");
      }
    } catch (error) {
      toast.error("Failed to update order");
      console.error(error);
    }
  };
  
  const handleDeleteOrder = () => {
    if (!selectedOrder) return;
    
    try {
      const deleted = deleteOrder(selectedOrder.id);
      if (deleted) {
        setOrdersList([...orders]);
        toast.success(`Order deleted successfully`);
      } else {
        toast.error("Order not found");
      }
    } catch (error) {
      toast.error("Failed to delete order");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    }
  };
  
  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTax = (items: CartItem[]): number => {
    // Calculate tax as 10% of the total
    return calculateTotal(items) * 0.1;
  };
  
  const addItemToOrder = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = orderItems.find(item => item.id === productId);
    
    if (existingItem) {
      // Update quantity if item already exists
      setOrderItems(orderItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      ));
    } else {
      // Add new item
      setOrderItems([...orderItems, { ...product, quantity }]);
    }
  };
  
  const removeItemFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
  };
  
  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(productId);
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.id === productId 
        ? { ...item, quantity } 
        : item
    ));
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order Management</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                ordersList.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{format(new Date(order.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{order.customerName || 'Guest'}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {paymentMethods.find(m => m.id === order.paymentMethod)?.name || order.paymentMethod}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderItems(order.items);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* View Order Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="py-4">
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                    <p>{selectedOrder.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p>{format(new Date(selectedOrder.date), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge className={statusColors[selectedOrder.status]}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                    <p>{paymentMethods.find(m => m.id === selectedOrder.paymentMethod)?.name || selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                    <p>{selectedOrder.customerName || 'Guest'}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
                
                <h3 className="mb-2 text-sm font-medium text-gray-500">Order Items</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                        <TableCell className="text-right">${(selectedOrder.total - selectedOrder.tax).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Tax</TableCell>
                        <TableCell className="text-right">${selectedOrder.tax.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                        <TableCell className="text-right font-medium">${selectedOrder.total.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Order Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={addForm.handleSubmit(handleAddOrder)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const customer = customers.find(c => c.id === value);
                          if (customer) {
                            addForm.setValue("customerId", customer.id);
                            addForm.setValue("customerName", customer.name);
                          } else {
                            addForm.setValue("customerName", "Guest");
                            addForm.setValue("customerId", undefined);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guest">Guest</SelectItem>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue="pending"
                        onValueChange={(value) => {
                          addForm.setValue("status", value as "pending" | "completed" | "cancelled");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue="cash"
                        onValueChange={(value) => {
                          addForm.setValue("paymentMethod", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...addForm.register("notes")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <h3 className="mb-2 text-sm font-medium">Order Items</h3>
                  
                  <div className="mb-4 flex gap-4">
                    <Select
                      onValueChange={(value) => {
                        addItemToOrder(value, 1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {orderItems.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>${item.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <span>{item.quantity}</span>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItemFromOrder(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                            <TableCell colSpan={2}>${calculateTotal(orderItems).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Tax (10%)</TableCell>
                            <TableCell colSpan={2}>${calculateTax(orderItems).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                            <TableCell colSpan={2} className="font-medium">
                              ${(calculateTotal(orderItems) + calculateTax(orderItems)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="rounded-md border p-4 text-center text-muted-foreground">
                      No items added to this order yet
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={orderItems.length === 0}
                >
                  Create Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={editForm.handleSubmit(handleEditOrder)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input 
                        readOnly
                        value={selectedOrder?.id || ''}
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        readOnly
                        value={selectedOrder ? format(new Date(selectedOrder.date), 'MMM dd, yyyy HH:mm') : ''}
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={selectedOrder?.customerId || "guest"}
                        onValueChange={(value) => {
                          const customer = customers.find(c => c.id === value);
                          if (customer) {
                            editForm.setValue("customerId", customer.id);
                            editForm.setValue("customerName", customer.name);
                          } else {
                            editForm.setValue("customerName", "Guest");
                            editForm.setValue("customerId", undefined);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guest">Guest</SelectItem>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={selectedOrder?.status || "pending"}
                        onValueChange={(value) => {
                          editForm.setValue("status", value as "pending" | "completed" | "cancelled");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={selectedOrder?.paymentMethod || "cash"}
                        onValueChange={(value) => {
                          editForm.setValue("paymentMethod", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...editForm.register("notes")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <h3 className="mb-2 text-sm font-medium">Order Items</h3>
                  
                  <div className="mb-4 flex gap-4">
                    <Select
                      onValueChange={(value) => {
                        addItemToOrder(value, 1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {orderItems.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>${item.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <span>{item.quantity}</span>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItemFromOrder(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                            <TableCell colSpan={2}>${calculateTotal(orderItems).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Tax (10%)</TableCell>
                            <TableCell colSpan={2}>${calculateTax(orderItems).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                            <TableCell colSpan={2} className="font-medium">
                              ${(calculateTotal(orderItems) + calculateTax(orderItems)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="rounded-md border p-4 text-center text-muted-foreground">
                      No items added to this order yet
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={orderItems.length === 0}
                >
                  Update Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the order "{selectedOrder?.id}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDeleteOrder}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Orders;
