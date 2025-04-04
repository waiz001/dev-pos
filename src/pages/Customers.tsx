
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  customers as allCustomers, 
  deleteCustomer, 
  updateCustomer 
} from "@/utils/data";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, FileUp } from "lucide-react";
import * as XLSX from 'xlsx';

// Import CustomerForm and AddCustomerButton from your components directory
import CustomerForm from "@/components/forms/CustomerForm";
import AddCustomerButton from "@/components/forms/AddCustomerButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ImportExcelDialog from "@/components/import-export/ImportExcelDialog";

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(allCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Update customers list when a new customer is added or updated
  useEffect(() => {
    const handleCustomerUpdated = () => {
      setCustomers([...allCustomers]);
    };
    
    // Add event listener
    window.addEventListener('customer-updated', handleCustomerUpdated);
    
    // Initial load
    setCustomers([...allCustomers]);
    
    // Cleanup
    return () => {
      window.removeEventListener('customer-updated', handleCustomerUpdated);
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (id) => {
    try {
      deleteCustomer(id);
      setCustomers(customers.filter(customer => customer.id !== id));
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleSubmitEdit = (data) => {
    try {
      if (selectedCustomer) {
        updateCustomer(selectedCustomer.id, data);
        toast.success("Customer updated successfully");
        setCustomers([...allCustomers]);
        setIsDialogOpen(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="mb-6 flex justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <AddCustomerButton />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Make changes to the customer information.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CustomerForm
              initialData={selectedCustomer}
              onSubmit={handleSubmitEdit}
              buttonText="Update Customer"
            />
          </div>
        </DialogContent>
      </Dialog>

      <ImportExcelDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        type="customers"
        onImportComplete={() => {
          setCustomers([...allCustomers]);
          toast.success("Customers imported successfully");
        }}
      />
    </MainLayout>
  );
};

export default Customers;
