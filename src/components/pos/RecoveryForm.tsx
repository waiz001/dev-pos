
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { customers, paymentMethods, updateCustomer } from "@/utils/data";

const formSchema = z.object({
  customerId: z.string().min(1, { message: "Please select a customer" }),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  paymentMethod: z.string().min(1, { message: "Please select a payment method" }),
});

const RecoveryForm = ({ onSuccess }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      amount: 0,
      paymentMethod: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data) => {
    setIsSubmitting(true);
    
    try {
      // Find the customer
      const customer = customers.find((c) => c.id === data.customerId);
      
      if (!customer) {
        toast.error("Customer not found");
        setIsSubmitting(false);
        return;
      }
      
      // Calculate new balance after recovery
      const updatedTotalSpent = customer.totalSpent - data.amount;
      
      // Update customer with new totalSpent (reducing the balance)
      const updatedCustomer = updateCustomer(customer.id, {
        totalSpent: updatedTotalSpent >= 0 ? updatedTotalSpent : 0,
      });
      
      if (updatedCustomer) {
        toast.success(`Successfully recovered $${data.amount} from ${customer.name}`);
        
        // Create a record in orders or a dedicated recoveries collection if needed
        // This could be implemented if needed
        
        if (onSuccess) {
          onSuccess();
        }
        
        form.reset();
      } else {
        toast.error("Failed to update customer balance");
      }
    } catch (error) {
      console.error("Recovery error:", error);
      toast.error("An error occurred during recovery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomerId = form.watch("customerId");
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentBalance = selectedCustomer?.totalSpent || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} (Balance: ${customer.totalSpent.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCustomerId && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm">Current Balance: <span className="font-semibold">${currentBalance.toFixed(2)}</span></p>
          </div>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Recover</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : parseFloat(value));
                  }}
                />
              </FormControl>
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Recover Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecoveryForm;
