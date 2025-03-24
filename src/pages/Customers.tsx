
import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Search, User } from "lucide-react";
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
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { 
  customers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  Customer 
} from "@/utils/data";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

const Customers = () => {
  const [customersList, setCustomersList] = useState<Customer[]>(customers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const addForm = useForm<Omit<Customer, "id">>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      registrationDate: new Date(),
      totalOrders: 0,
      totalSpent: 0,
      notes: ""
    }
  });
  
  const editForm = useForm<Customer>({
    defaultValues: selectedCustomer || {
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      registrationDate: new Date(),
      totalOrders: 0,
      totalSpent: 0,
      notes: ""
    }
  });
  
  // Update edit form when selected customer changes
  React.useEffect(() => {
    if (selectedCustomer) {
      editForm.reset(selectedCustomer);
    }
  }, [selectedCustomer, editForm]);
  
  const handleSearch = () => {
    if (!searchQuery) {
      setCustomersList(customers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(query) || 
      customer.email.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
    
    setCustomersList(filtered);
  };
  
  // Search customers when query changes
  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, customers]);
  
  const handleAddCustomer = (data: Omit<Customer, "id">) => {
    try {
      const newCustomer = addCustomer(data);
      setCustomersList([...customers]);
      toast.success(`Customer "${newCustomer.name}" added successfully`);
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      toast.error("Failed to add customer");
      console.error(error);
    }
  };
  
  const handleEditCustomer = (data: Customer) => {
    if (!selectedCustomer) return;
    
    try {
      const updated = updateCustomer(selectedCustomer.id, data);
      if (updated) {
        setCustomersList([...customers]);
        toast.success(`Customer "${updated.name}" updated successfully`);
        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
      } else {
        toast.error("Customer not found");
      }
    } catch (error) {
      toast.error("Failed to update customer");
      console.error(error);
    }
  };
  
  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return;
    
    try {
      const deleted = deleteCustomer(selectedCustomer.id);
      if (deleted) {
        setCustomersList([...customers]);
        toast.success(`Customer deleted successfully`);
      } else {
        toast.error("Customer not found");
      }
    } catch (error) {
      toast.error("Failed to delete customer");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customersList.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{format(new Date(customer.registrationDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
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
        
        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={addForm.handleSubmit(handleAddCustomer)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Customer name" 
                        {...addForm.register("name")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        {...addForm.register("email")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...addForm.register("phone")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Registration Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...addForm.register("registrationDate", {
                          setValueAs: (value) => value ? new Date(value) : new Date()
                        })} 
                        defaultValue={format(new Date(), 'yyyy-MM-dd')}
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...addForm.register("address")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Total Orders</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...addForm.register("totalOrders", { 
                          valueAsNumber: true,
                          min: 0
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Total Spent</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...addForm.register("totalSpent", { 
                          valueAsNumber: true,
                          min: 0
                        })} 
                        required 
                      />
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
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Customer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={editForm.handleSubmit(handleEditCustomer)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Customer name" 
                        {...editForm.register("name")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        {...editForm.register("email")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...editForm.register("phone")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Registration Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...editForm.register("registrationDate", {
                          setValueAs: (value) => value ? new Date(value) : new Date()
                        })} 
                        defaultValue={selectedCustomer ? format(new Date(selectedCustomer.registrationDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...editForm.register("address")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Total Orders</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...editForm.register("totalOrders", { 
                          valueAsNumber: true,
                          min: 0
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Total Spent</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...editForm.register("totalSpent", { 
                          valueAsNumber: true,
                          min: 0
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
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
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
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
                This will permanently delete the customer "{selectedCustomer?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDeleteCustomer}
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

export default Customers;
