
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import { addProduct } from "@/utils/data";
import { toast } from "sonner";

const AddProductButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddProduct = (data: any) => {
    try {
      const newProduct = addProduct(data);
      setIsOpen(false);
      toast.success(`Product "${newProduct.name}" added successfully`);
      
      // Dispatch the custom event to notify other components about the product update
      window.dispatchEvent(new CustomEvent('product-updated'));
    } catch (error) {
      toast.error("Failed to add product");
      console.error(error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Product
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleAddProduct} buttonText="Add Product" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddProductButton;
