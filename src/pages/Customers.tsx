
import React, { useState, useMemo } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { customers, deleteCustomer } from "@/utils/data";
import { format } from "date-fns";
import { FileDown, FileUp, Pencil, Trash, UserPlus } from "lucide-react";
import { toast } from "sonner";
import CustomerForm from "@/components/forms/CustomerForm";
import AddCustomerButton from "@/components/forms/AddCustomerButton";
import CustomerBalance from "@/components/customers/CustomerBalance";
import { 
  downloadCustomersTemplate, 
  exportCustomersToExcel 
} from "@/utils/excelUtils";
import ImportExcelDialog from "@/components/import-export/ImportExcelDialog";

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const success = deleteCustomer(id);
      if (success) {
        toast.success("Customer deleted successfully");
      } else {
        toast.error("Failed to delete customer");
      }
    }
  };

  const openBalanceDialog = (customer) => {
    setSelectedCustomer(customer);
    setIsBalanceDialogOpen(true);
  };

  const handleCustomerTemplateDownload = () => {
    downloadCustomersTemplate();
    toast.success("Customer template downloaded");
  };

  const handleImportCustomers = () => {
    setIsImportDialogOpen(true);
  };

  const handleExportCustomers = () => {
    exportCustomersToExcel();
    toast.success("Customers exported to Excel");
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCustomerTemplateDownload}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportCustomers}>
              <FileUp className="mr-2 h-4 w-4" />
              Import Customers
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCustomers}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Customers
            </Button>
            <AddCustomerButton />
          </div>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
            <CardDescription>Manage your customer database</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "N/A"}</TableCell>
                      <TableCell>
                        {format(new Date(customer.registrationDate), "PP")}
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openBalanceDialog(customer)}
                          >
                            Balance
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm
              initialData={editingCustomer}
              onSuccess={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Customer Balance</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerBalance
              customer={selectedCustomer}
              onSuccess={() => setIsBalanceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <ImportExcelDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        type="customers"
        onImportComplete={() => {
          setIsImportDialogOpen(false);
          setSearchQuery("");
        }}
      />
    </MainLayout>
  );
};

export default Customers;
