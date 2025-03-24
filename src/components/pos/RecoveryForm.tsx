
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { paymentMethods, customers, updateCustomer } from "@/utils/data";
import { toast } from "sonner";

const recoverySchema = z.object({
  customerId: z.string({
    required_error: "Please select a customer",
  }),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: "Amount must be a positive number",
    }
  ),
  paymentMethod: z.string({
    required_error: "Please select a payment method",
  }),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

interface RecoveryFormProps {
  onSuccess: () => void;
}

const RecoveryForm: React.FC<RecoveryFormProps> = ({ onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      customerId: "",
      amount: "",
      paymentMethod: "",
    },
  });

  const handleSubmit = (values: RecoveryFormValues) => {
    setIsProcessing(true);
    
    try {
      const customer = customers.find(c => c.id === values.customerId);
      if (!customer) {
        toast.error("Customer not found");
        return;
      }
      
      const amount = parseFloat(values.amount);
      
      // Create a recovery transaction
      const updatedCustomer = updateCustomer(customer.id, {
        // You would normally have a dedicated balance field
        // For this implementation, we'll update the totalSpent to simulate a payment
        totalSpent: customer.totalSpent + amount,
      });
      
      if (updatedCustomer) {
        toast.success(`Successfully recovered $${amount.toFixed(2)} from ${customer.name}`);
        onSuccess();
        form.reset();
      } else {
        toast.error("Failed to process recovery");
      }
    } catch (error) {
      console.error("Recovery error:", error);
      toast.error("An error occurred during recovery");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} (Balance: ${(customer.totalOrders * 10 - customer.totalSpent).toFixed(2)})
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recovery Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  placeholder="Enter amount" 
                  {...field} 
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

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Recovery"}
        </Button>
      </form>
    </Form>
  );
};

export default RecoveryForm;
