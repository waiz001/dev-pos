
import React, { useState } from 'react';
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

// Shop data type
interface Shop {
  id: string;
  name: string;
  address: string;
  contact: string;
  description?: string;
}

// Mock data - in a real app this would come from a backend
const defaultShops: Shop[] = [
  {
    id: 'shop-1',
    name: 'Main Store',
    address: '123 Main St, Anytown',
    contact: '555-123-4567',
    description: 'Our flagship store'
  }
];

// Load shops from localStorage or use defaults
const loadShops = (): Shop[] => {
  try {
    const storedShops = localStorage.getItem('shops');
    return storedShops ? JSON.parse(storedShops) : defaultShops;
  } catch (error) {
    console.error('Error loading shops:', error);
    return defaultShops;
  }
};

// Save shops to localStorage
const saveShops = (shops: Shop[]): void => {
  try {
    localStorage.setItem('shops', JSON.stringify(shops));
  } catch (error) {
    console.error('Error saving shops:', error);
  }
};

// Form schema
const shopFormSchema = z.object({
  name: z.string().min(1, { message: 'Shop name is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  contact: z.string().min(1, { message: 'Contact information is required' }),
  description: z.string().optional()
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopManagementProps {
  // Any props needed
}

const ShopManagement: React.FC<ShopManagementProps> = () => {
  const [shops, setShops] = useState<Shop[]>(loadShops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deleteShopId, setDeleteShopId] = useState<string | null>(null);
  
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      address: '',
      contact: '',
      description: ''
    }
  });
  
  // Edit a shop
  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    form.reset({
      name: shop.name,
      address: shop.address,
      contact: shop.contact,
      description: shop.description || ''
    });
    setIsDialogOpen(true);
  };
  
  // Delete a shop
  const handleDeleteShop = (shopId: string) => {
    const updatedShops = shops.filter(shop => shop.id !== shopId);
    setShops(updatedShops);
    saveShops(updatedShops);
    setDeleteShopId(null);
    toast.success('Shop deleted successfully');
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
        ...values
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
                  onClick={() => setDeleteShopId(shop.id)}
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteShopId} onOpenChange={(open) => !open && setDeleteShopId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shop? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteShopId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteShopId && handleDeleteShop(deleteShopId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopManagement;
