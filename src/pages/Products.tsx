
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  products as allProducts, 
  deleteProduct as deleteProductData,
  addProduct as addProductData,
  updateProduct as updateProductData,
  categories
} from "@/utils/data";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, FileDown, FileUp } from "lucide-react";
import ProductForm from "@/components/forms/ProductForm";
import ImportExcelDialog from "@/components/import-export/ImportExcelDialog";

// Create wrapper components to handle the props mismatch
const ProductFormWrapper = ({ initialData, onSuccess }) => {
  const onSubmit = (formData) => {
    try {
      if (initialData) {
        updateProductData(initialData.id, formData);
        toast.success("Product updated successfully");
      } else {
        addProductData(formData);
        toast.success("Product added successfully");
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting product form:", error);
      toast.error("Failed to save product");
    }
  };

  return <ProductForm initialData={initialData} onSubmit={onSubmit} />;
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(allProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    setProducts(allProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
  };

  const handleDelete = (id: string) => {
    try {
      deleteProductData(id);
      setProducts(allProducts);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: any) => {
    setEditProduct(product);
    handleOpen();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="mb-6 flex justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button onClick={handleOpen}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{categories.find(cat => cat.id === product.category)?.name || 'N/A'}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.inStock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>
                {editProduct ? "Edit product details." : "Create a new product."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ProductFormWrapper
                initialData={editProduct}
                onSuccess={handleClose}
              />
            </div>
          </DialogContent>
        </Dialog>
        
        <ImportExcelDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          type="products"
          onImportComplete={() => {
            setProducts(allProducts);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Products;
