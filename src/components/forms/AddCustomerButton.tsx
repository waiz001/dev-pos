
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      
      // Dispatch the custom event to notify other components about the customer update
      window.dispatchEvent(new CustomEvent('customer-updated'));
    } catch (error) {
      toast.error("Failed to add customer");
      console.error(error);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="whitespace-nowrap w-full sm:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Customer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer details below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="p-1">
              <CustomerForm onSubmit={handleAddCustomer} buttonText="Add Customer" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCustomerButton;
