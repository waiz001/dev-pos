
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { stores } from '@/utils/data';

// Shop data type
interface Shop {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
}

// Load shops from localStorage or use defaults
const loadShops = (): Shop[] => {
  try {
    const storedShops = localStorage.getItem('shops');
    if (storedShops) {
      return JSON.parse(storedShops);
    }
    
    // Convert from data.ts format
    return stores.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address || '',
      contactNumber: store.contactNumber || '',
    }));
  } catch (error) {
    console.error('Error loading shops:', error);
    return stores.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address || '',
      contactNumber: store.contactNumber || '',
    }));
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
  contactNumber: z.string().min(1, { message: 'Contact number is required' }),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

const ShopManagement: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>(loadShops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deleteShopId, setDeleteShopId] = useState<string | null>(null);
  
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      address: '',
      contactNumber: '',
    }
  });
  
  // Edit shop
  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    form.reset({
      name: shop.name,
      address: shop.address,
      contactNumber: shop.contactNumber,
    });
    setIsDialogOpen(true);
  };
  
  // Delete shop
  const handleDeleteShop = (shopId: string) => {
    const updatedShops = shops.filter(shop => shop.id !== shopId);
    setShops(updatedShops);
    saveShops(updatedShops);
    setDeleteShopId(null);
    toast.success('Shop deleted successfully');
  };
  
  // Add or update shop
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
        ...values,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Shops</h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add POS Shop
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shops.map(shop => (
          <Card key={shop.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-semibold">{shop.name}</h3>
                <p className="text-sm text-muted-foreground">{shop.address}</p>
                <p className="text-sm text-muted-foreground">{shop.contactNumber}</p>
                
                <div className="flex justify-end gap-2 pt-4">
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add/Edit Shop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingShop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
            <DialogDescription>
              {editingShop 
                ? 'Update the shop details below' 
                : 'Enter details to add a new shop'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-220px)] pr-4">
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
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              {editingShop ? 'Update Shop' : 'Add Shop'}
            </Button>
          </DialogFooter>
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
