
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { paymentMethods } from '@/utils/data';

// Payment method data type
interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

// Load payment methods from localStorage or use defaults
const loadPaymentMethods = (): PaymentMethod[] => {
  try {
    const storedMethods = localStorage.getItem('paymentMethods');
    if (storedMethods) {
      return JSON.parse(storedMethods);
    }
    
    // Convert from data.ts format to our format with isActive
    return paymentMethods.map(method => ({
      id: method.id,
      name: method.name,
      isActive: true
    }));
  } catch (error) {
    console.error('Error loading payment methods:', error);
    return paymentMethods.map(method => ({
      id: method.id,
      name: method.name,
      isActive: true
    }));
  }
};

// Save payment methods to localStorage
const savePaymentMethods = (methods: PaymentMethod[]): void => {
  try {
    localStorage.setItem('paymentMethods', JSON.stringify(methods));
  } catch (error) {
    console.error('Error saving payment methods:', error);
  }
};

// Form schema
const paymentMethodFormSchema = z.object({
  name: z.string().min(1, { message: 'Payment method name is required' }),
  isActive: z.boolean().default(true)
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;

interface PaymentMethodsManagementProps {
  // Any props needed
}

const PaymentMethodsManagement: React.FC<PaymentMethodsManagementProps> = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>(loadPaymentMethods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null);
  
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: '',
      isActive: true
    }
  });
  
  // Edit payment method
  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    form.reset({
      name: method.name,
      isActive: method.isActive
    });
    setIsDialogOpen(true);
  };
  
  // Delete payment method
  const handleDeleteMethod = (methodId: string) => {
    const updatedMethods = methods.filter(method => method.id !== methodId);
    setMethods(updatedMethods);
    savePaymentMethods(updatedMethods);
    setDeleteMethodId(null);
    toast.success('Payment method deleted successfully');
  };
  
  // Toggle payment method active status
  const toggleMethodActive = (methodId: string) => {
    const updatedMethods = methods.map(method => 
      method.id === methodId ? { ...method, isActive: !method.isActive } : method
    );
    setMethods(updatedMethods);
    savePaymentMethods(updatedMethods);
  };
  
  // Add or update payment method
  const onSubmit = (values: PaymentMethodFormValues) => {
    if (editingMethod) {
      // Update existing method
      const updatedMethods = methods.map(method => 
        method.id === editingMethod.id ? { ...method, ...values } : method
      );
      setMethods(updatedMethods);
      savePaymentMethods(updatedMethods);
      toast.success('Payment method updated successfully');
    } else {
      // Add new method
      const newMethod: PaymentMethod = {
        id: `payment-${Date.now()}`,
        name: values.name,
        isActive: values.isActive
      };
      const updatedMethods = [...methods, newMethod];
      setMethods(updatedMethods);
      savePaymentMethods(updatedMethods);
      toast.success('Payment method added successfully');
    }
    
    handleCloseDialog();
  };
  
  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMethod(null);
    form.reset();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment Methods</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {methods.map(method => (
          <Card key={method.id} className={!method.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{method.name}</span>
                <Switch 
                  checked={method.isActive} 
                  onCheckedChange={() => toggleMethodActive(method.id)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {method.isActive 
                  ? "This payment method is active and available for use" 
                  : "This payment method is currently inactive"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-0">
              <Button variant="outline" size="sm" onClick={() => handleEditMethod(method)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteMethodId(method.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
            <DialogDescription>
              {editingMethod 
                ? 'Update the payment method details below' 
                : 'Enter details to add a new payment method'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Credit Card, Cash, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enable this payment method for transactions
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMethod ? 'Update Method' : 'Add Method'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteMethodId} onOpenChange={(open) => !open && setDeleteMethodId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMethodId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMethodId && handleDeleteMethod(deleteMethodId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsManagement;
