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
  categories,
  stores
} from "@/utils/data";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, FileDown, FileUp, Download } from "lucide-react";
import ProductForm from "@/components/forms/ProductForm";
import ImportExcelDialog from "@/components/import-export/ImportExcelDialog";
import AddProductButton from "@/components/forms/AddProductButton";
import { generateProductsTemplate } from "@/utils/pdfUtils";
import * as XLSX from 'xlsx';

const ProductFormWrapper = ({ initialData, onSuccess }) => {
  const onSubmit = (formData) => {
    try {
      console.log("ProductFormWrapper onSubmit - initialData:", initialData);
      console.log("ProductFormWrapper onSubmit - formData:", formData);
      
      // Convert "all" back to empty string for storeId if needed
      const processedData = {
        ...formData,
        storeId: formData.storeId === "all" ? "" : formData.storeId
      };
      
      if (initialData && initialData.id) {
        // Update existing product
        const updatedProduct = updateProductData(initialData.id, processedData);
        console.log("Updated product:", updatedProduct);
        toast.success("Product updated successfully");
      } else {
        // Add new product
        const newProduct = addProductData(processedData);
        console.log("New product:", newProduct);
        toast.success("Product added successfully");
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Dispatch event to update the product list
      window.dispatchEvent(new CustomEvent('product-updated'));
    } catch (error) {
      console.error("Error submitting product form:", error);
      toast.error("Failed to save product");
    }
  };

  // Pre-process initialData to convert empty storeId to "all"
  const processedInitialData = initialData ? {
    ...initialData,
    storeId: initialData.storeId === "" ? "all" : initialData.storeId
  } : {};

  return <ProductForm initialData={processedInitialData} onSubmit={onSubmit} buttonText={initialData?.id ? "Update Product" : "Add Product"} />;
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(allProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // This effect will run once on component mount and set up the event listener
  useEffect(() => {
    const handleProductUpdated = () => {
      setProducts([...allProducts]);
    };
    
    // Add event listener
    window.addEventListener('product-updated', handleProductUpdated);
    
    // Initial load
    setProducts([...allProducts]);
    
    // Cleanup
    return () => {
      window.removeEventListener('product-updated', handleProductUpdated);
    };
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
      setProducts([...allProducts]);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: any) => {
    console.log("Edit product:", product);
    setEditProduct(product);
    handleOpen();
  };

  // Safe category name lookup function
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'N/A';
  };

  // Store name lookup function
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'All Stores';
  };

  // Download template function
  const downloadProductTemplate = () => {
    try {
      const template = generateProductsTemplate();
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([template.headers, ...template.data]);
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "product_import_template.xlsx");
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Failed to download template");
    }
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
            <Button variant="outline" onClick={downloadProductTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
            <Button onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <AddProductButton />
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
                  <TableHead>Store</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{getCategoryName(product.category)}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.storeId ? 
                        getStoreName(product.storeId) : 
                        'All Stores'}
                    </TableCell>
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
          <DialogContent className="sm:max-w-[550px]">
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
            setProducts([...allProducts]);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Products;
