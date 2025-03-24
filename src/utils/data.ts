
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  barcode?: string;
  inStock: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: Date;
  customerId?: string;
  notes?: string;
}

// Sample categories
export const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'food', name: 'Food' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' }
];

// Sample products
export const products: Product[] = [
  {
    id: 'product-1',
    name: 'Espresso',
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1612337857154-91c9a54d4e55?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'drinks',
    barcode: '8901234567',
    inStock: 100
  },
  {
    id: 'product-2',
    name: 'Cappuccino',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'drinks',
    barcode: '8901234568',
    inStock: 100
  },
  {
    id: 'product-3',
    name: 'Chicken Sandwich',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1598182198871-d3f4ab4fd181?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'food',
    barcode: '8901234569',
    inStock: 30
  },
  {
    id: 'product-4',
    name: 'Chocolate Cake',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'dessert',
    barcode: '8901234570',
    inStock: 20
  },
  {
    id: 'product-5',
    name: 'Vegetable Salad',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'food',
    barcode: '8901234571',
    inStock: 25
  },
  {
    id: 'product-6',
    name: 'Fresh Orange Juice',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'drinks',
    barcode: '8901234572',
    inStock: 40
  },
  {
    id: 'product-7',
    name: 'Cheesecake',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'dessert',
    barcode: '8901234573',
    inStock: 15
  },
  {
    id: 'product-8',
    name: 'Iced Coffee',
    price: 3.75,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'drinks',
    barcode: '8901234574',
    inStock: 60
  },
  {
    id: 'product-9',
    name: 'Wireless Earbuds',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1606058800874-5421730db9e3?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'electronics',
    barcode: '8901234575',
    inStock: 10
  },
  {
    id: 'product-10',
    name: 'T-Shirt',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'clothing',
    barcode: '8901234576',
    inStock: 25
  },
  {
    id: 'product-11',
    name: 'Burger',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'food',
    barcode: '8901234577',
    inStock: 20
  },
  {
    id: 'product-12',
    name: 'Smart Watch',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'electronics',
    barcode: '8901234578',
    inStock: 8
  }
];

// Payment methods
export const paymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'credit-card', name: 'Credit Card' },
  { id: 'debit-card', name: 'Debit Card' },
  { id: 'mobile-payment', name: 'Mobile Payment' }
];
