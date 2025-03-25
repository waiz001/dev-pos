
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addCustomer,
  updateCustomer,
  customers as allCustomers,
  Customer,
  deleteCustomer as deleteCustomerData,
} from "@/utils/data";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Wallet } from "lucide-react";
import CustomerForm from "@/components/forms/CustomerForm";
import CustomerBalance from "@/components/customers/CustomerBalance";

// Create wrapper components to handle the props mismatch
const CustomerFormWrapper = ({ initialData, onSuccess }: { initialData: any, onSuccess: () => void }) => {
  const handleSubmit = (data: any) => {
    if (initialData?.id) {
      // Update existing customer
      updateCustomer(initialData.id, data);
      toast.success("Customer updated successfully");
    } else {
      // Add new customer
      addCustomer({
        ...data,
        registrationDate: new Date(),
        totalOrders: 0,
        totalSpent: 0,
      });
      toast.success("Customer added successfully");
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return <CustomerForm initialData={initialData} onSubmit={handleSubmit} buttonText={initialData?.id ? "Update Customer" : "Add Customer"} />;
};

const CustomerBalanceWrapper = ({ customer, onSuccess }: { customer: any, onSuccess: () => void }) => {
  return <CustomerBalance customer={customer} onSuccess={onSuccess} />;
};

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);

  useEffect(() => {
    setCustomers(allCustomers);
  }, []);

  // Refresh customers when a new customer is added or updated
  useEffect(() => {
    const handleCustomerUpdate = () => {
      setCustomers(allCustomers);
    };

    window.addEventListener('customer-updated', handleCustomerUpdate);
    
    return () => {
      window.removeEventListener('customer-updated', handleCustomerUpdate);
    };
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerFormOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (confirmDelete) {
      const success = deleteCustomerData(id);
      if (success) {
        setCustomers(allCustomers);
        toast.success("Customer deleted successfully");
      } else {
        toast.error("Failed to delete customer");
      }
    }
  };

  const handleBalance = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsBalanceDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAddCustomer}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "N/A"}</TableCell>
                      <TableCell>
                        {customer.registrationDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBalance(customer)}
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            Balance
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCustomerFormOpen} onOpenChange={setIsCustomerFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer
                ? "Update customer information here."
                : "Enter the customer details below."}
            </DialogDescription>
          </DialogHeader>
          <CustomerFormWrapper initialData={selectedCustomer} onSuccess={() => setIsCustomerFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Balance</DialogTitle>
            <DialogDescription>
              View and manage customer balance.
            </DialogDescription>
          </DialogHeader>
          <CustomerBalanceWrapper customer={selectedCustomer} onSuccess={() => setIsBalanceDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Customers;
