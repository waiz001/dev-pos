
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomerForm from "./CustomerForm";
import { addCustomer } from "@/utils/data";
import { toast } from "sonner";

const AddCustomerButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddCustomer = (data: any) => {
    try {
      const newCustomer = {
        ...data,
        registrationDate: new Date(),
        totalOrders: 0,
        totalSpent: 0,
      };
      
      addCustomer(newCustomer);
      setIsOpen(false);
      toast.success(`Customer "${data.name}" added successfully`);
      
      // Force a rerender by dispatching a custom event without refreshing the page
      window.dispatchEvent(new CustomEvent('customer-updated'));
    } catch (error) {
      toast.error("Failed to add customer");
      console.error(error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Customer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSubmit={handleAddCustomer} buttonText="Add Customer" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCustomerButton;
