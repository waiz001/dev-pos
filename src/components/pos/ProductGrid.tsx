
import React from "react";
import { Plus } from "lucide-react";
import { Product } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  // Guard against empty products array
  if (!products || products.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No products available in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <Card
          key={product.id}
          className="product-item overflow-hidden animate-scale-in"
          data-product-name={product.name}
          data-product-id={product.id}
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <span className="font-medium text-white">${product.price.toFixed(2)}</span>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="mb-2 line-clamp-1 font-medium">{product.name}</div>
            <Button
              className="w-full transition-smooth"
              size="sm"
              onClick={() => onAddToCart(product)}
              data-testid={`add-product-${product.id}`}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
