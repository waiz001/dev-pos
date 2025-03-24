
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
      addProduct(data);
      setIsOpen(false);
      toast.success(`Product "${data.name}" added successfully`);
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
