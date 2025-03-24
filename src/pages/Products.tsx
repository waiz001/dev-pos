
import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { 
  products, 
  categories, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  Product 
} from "@/utils/data";
import { useForm } from "react-hook-form";

const Products = () => {
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const addForm = useForm<Omit<Product, "id">>({
    defaultValues: {
      name: "",
      price: 0,
      image: "",
      category: "drinks",
      barcode: "",
      inStock: 0,
      description: ""
    }
  });
  
  const editForm = useForm<Product>({
    defaultValues: selectedProduct || {
      id: "",
      name: "",
      price: 0,
      image: "",
      category: "drinks",
      barcode: "",
      inStock: 0,
      description: ""
    }
  });
  
  // Update edit form when selected product changes
  React.useEffect(() => {
    if (selectedProduct) {
      editForm.reset(selectedProduct);
    }
  }, [selectedProduct, editForm]);
  
  const handleSearch = () => {
    if (!searchQuery) {
      setProductsList(products);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.category.toLowerCase().includes(query) ||
      product.barcode?.toLowerCase().includes(query)
    );
    
    setProductsList(filtered);
  };
  
  // Search products when query changes
  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, products]);
  
  const handleAddProduct = (data: Omit<Product, "id">) => {
    try {
      const newProduct = addProduct(data);
      setProductsList([...products]);
      toast.success(`Product "${newProduct.name}" added successfully`);
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      toast.error("Failed to add product");
      console.error(error);
    }
  };
  
  const handleEditProduct = (data: Product) => {
    if (!selectedProduct) return;
    
    try {
      const updated = updateProduct(selectedProduct.id, data);
      if (updated) {
        setProductsList([...products]);
        toast.success(`Product "${updated.name}" updated successfully`);
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    }
  };
  
  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    
    try {
      const deleted = deleteProduct(selectedProduct.id);
      if (deleted) {
        setProductsList([...products]);
        toast.success(`Product deleted successfully`);
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Product Management</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                productsList.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {categories.find(c => c.id === product.category)?.name || product.category}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.inStock}</TableCell>
                    <TableCell>{product.barcode || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={addForm.handleSubmit(handleAddProduct)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Product name" 
                        {...addForm.register("name")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...addForm.register("price", { 
                          valueAsNumber: true 
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...addForm.register("inStock", { 
                          valueAsNumber: true 
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...addForm.register("image")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...addForm.register("category")}
                      >
                        {categories
                          .filter(category => category.id !== 'all')
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))
                        }
                      </select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...addForm.register("barcode")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...addForm.register("description")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={editForm.handleSubmit(handleEditProduct)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Product name" 
                        {...editForm.register("name")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...editForm.register("price", { 
                          valueAsNumber: true 
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...editForm.register("inStock", { 
                          valueAsNumber: true 
                        })} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...editForm.register("image")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...editForm.register("category")}
                      >
                        {categories
                          .filter(category => category.id !== 'all')
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))
                        }
                      </select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...editForm.register("barcode")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Optional" 
                        {...editForm.register("description")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the product "{selectedProduct?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDeleteProduct}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Products;
