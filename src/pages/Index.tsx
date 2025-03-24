
import React, { useState, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/MainLayout";
import CategoryFilter from "@/components/pos/CategoryFilter";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import Checkout from "@/components/pos/Checkout";
import { Product, CartItem, categories, products } from "@/utils/data";
import { toast } from "sonner";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products based on selected category and search query
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery]);

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if item already in cart
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    
    toast.success(`Added ${product.name} to cart`);
  };

  // Handle updating item quantity in cart
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Handle removing item from cart
  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Handle clearing all items from cart
  const handleClearCart = () => {
    setCartItems([]);
    toast.info("Cart cleared");
  };

  // Handle checkout process
  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  // Handle completing order
  const handleCompleteOrder = () => {
    // Here you would typically save the order to a database
    setIsCheckoutOpen(false);
    setCartItems([]);
    toast.success("Order completed successfully!");
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-7rem)] flex-col gap-6 lg:flex-row">
        {/* Products section */}
        <div className="flex-1 overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Point of Sale</h1>
            <div className="relative w-64">
              <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="h-[calc(100%-8rem)] overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
        </div>

        {/* Cart section */}
        <div className="w-full lg:w-[350px]">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Checkout dialog */}
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onConfirm={handleCompleteOrder}
      />
    </MainLayout>
  );
};

export default Index;
