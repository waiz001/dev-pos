
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Shop data type
interface Shop {
  id: string;
  name: string;
  address: string;
  contact: string;
  description?: string;
  phone?: string;
  hours?: string;
  employees?: number;
  image?: string;
}

// Default shops from data.ts
const getDefaultShops = () => {
  try {
    const { stores } = require('@/utils/data');
    return stores;
  } catch (error) {
    console.error('Error loading default shops:', error);
    return [];
  }
};

// Load shops from localStorage or use defaults
const loadShops = (): Shop[] => {
  try {
    const storedShops = localStorage.getItem('shops');
    if (storedShops) {
      return JSON.parse(storedShops);
    }
    
    // If not found in localStorage, use the defaults and save them
    const defaultShops = getDefaultShops();
    localStorage.setItem('shops', JSON.stringify(defaultShops));
    return defaultShops;
  } catch (error) {
    console.error('Error loading shops:', error);
    return getDefaultShops();
  }
};

// Save shops to localStorage and trigger update event
const saveShops = (shops: Shop[]): void => {
  try {
    localStorage.setItem('shops', JSON.stringify(shops));
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('shops-updated'));
  } catch (error) {
    console.error('Error saving shops:', error);
  }
};

// Form schema
const shopFormSchema = z.object({
  name: z.string().min(1, { message: 'Shop name is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  contact: z.string().min(1, { message: 'Contact information is required' }),
  description: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  employees: z.coerce.number().optional(),
  image: z.string().optional()
});

// Password validation schema
const passwordSchema = z.object({
  password: z.string().min(1, { message: 'Password is required' })
});

type ShopFormValues = z.infer<typeof shopFormSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ShopManagementProps {
  // Any props needed
}

const ShopManagement: React.FC<ShopManagementProps> = () => {
  const [shops, setShops] = useState<Shop[]>(loadShops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deleteShopId, setDeleteShopId] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      address: '',
      contact: '',
      description: '',
      phone: '',
      hours: '',
      employees: 0,
      image: ''
    }
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: ''
    }
  });

  // Synchronize with localStorage when component mounts
  useEffect(() => {
    setShops(loadShops());
  }, []);
  
  // Edit a shop
  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    form.reset({
      name: shop.name,
      address: shop.address,
      contact: shop.contact,
      description: shop.description || '',
      phone: shop.phone || '',
      hours: shop.hours || '',
      employees: shop.employees || 0,
      image: shop.image || ''
    });
    setIsDialogOpen(true);
  };
  
  // Initiate delete process - first ask for password
  const handleDeleteClick = (shopId: string) => {
    setDeleteShopId(shopId);
    // If user is admin, show password confirmation
    if (currentUser?.role === 'admin') {
      setIsPasswordDialogOpen(true);
    } else {
      toast.error("Only administrators can delete shops");
    }
  };
  
  // Verify password and delete shop if correct
  const handlePasswordSubmit = (values: PasswordFormValues) => {
    // In a real app, you would validate against actual admin password
    // For demo purposes, we'll use a hardcoded password
    if (values.password === "admin") {
      if (deleteShopId) {
        const updatedShops = shops.filter(shop => shop.id !== deleteShopId);
        setShops(updatedShops);
        saveShops(updatedShops);
        toast.success('Shop deleted successfully');
      }
      setIsPasswordDialogOpen(false);
      setDeleteShopId(null);
      passwordForm.reset();
    } else {
      toast.error("Incorrect administrator password");
    }
  };
  
  // Add or update a shop
  const onSubmit = (values: ShopFormValues) => {
    if (editingShop) {
      // Update existing shop
      const updatedShops = shops.map(shop => 
        shop.id === editingShop.id ? { ...shop, ...values } : shop
      );
      setShops(updatedShops);
      saveShops(updatedShops);
      toast.success('Shop updated successfully');
    } else {
      // Add new shop
      const newShop: Shop = {
        id: `shop-${Date.now()}`,
        name: values.name,
        address: values.address,
        contact: values.contact,
        description: values.description,
        phone: values.phone || '',
        hours: values.hours || '9:00 AM - 5:00 PM',
        employees: values.employees || 1,
        image: values.image || 'https://images.unsplash.com/photo-1582539511848-55707aee0625?auto=format&fit=crop&q=80&w=500&h=300'
      };
      const updatedShops = [...shops, newShop];
      setShops(updatedShops);
      saveShops(updatedShops);
      toast.success('Shop added successfully');
    }
    
    handleCloseDialog();
  };
  
  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingShop(null);
    form.reset();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shop Management</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shop
        </Button>
      </div>
      
      {shops.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No shops added yet. Click "Add Shop" to create your first shop.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shops.map(shop => (
            <Card key={shop.id}>
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
                <CardDescription>{shop.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2"><strong>Contact:</strong> {shop.contact}</p>
                {shop.phone && (
                  <p className="text-sm mb-2"><strong>Phone:</strong> {shop.phone}</p>
                )}
                {shop.hours && (
                  <p className="text-sm mb-2"><strong>Hours:</strong> {shop.hours}</p>
                )}
                {shop.employees && (
                  <p className="text-sm mb-2"><strong>Employees:</strong> {shop.employees}</p>
                )}
                {shop.description && (
                  <p className="text-sm text-muted-foreground">{shop.description}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditShop(shop)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteClick(shop.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Shop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingShop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
            <DialogDescription>
              {editingShop 
                ? 'Update the shop information below' 
                : 'Fill in the details to add a new shop to your system'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter shop name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter shop address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9:00 AM - 5:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter number of employees" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the shop image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter shop description" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingShop ? 'Update Shop' : 'Add Shop'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Admin Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Administrator Verification</DialogTitle>
            <DialogDescription>
              Please enter your administrator password to confirm shop deletion.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter admin password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setDeleteShopId(null);
                    passwordForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  Confirm Delete
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog - Now we bypass this and use the password dialog instead */}
      {/* We've removed the delete confirmation dialog and replaced it with the admin password dialog */}
    </div>
  );
};

export default ShopManagement;
