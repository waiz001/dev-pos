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

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  registrationDate: Date;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: Date;
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  notes?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'customers' | 'custom';
  description: string;
  createdAt: Date;
  lastRun?: Date;
  format: 'pdf' | 'excel' | 'csv';
  scheduled: boolean;
  scheduledFrequency?: 'daily' | 'weekly' | 'monthly';
}

export interface Setting {
  id: string;
  name: string;
  value: string;
  category: 'general' | 'payment' | 'tax' | 'printer' | 'notification' | 'security';
  description: string;
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
export let products: Product[] = [
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

// Sample customers
export let customers: Customer[] = [
  {
    id: 'customer-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    registrationDate: new Date('2023-01-15'),
    totalOrders: 5,
    totalSpent: 245.50,
    notes: 'Regular customer, prefers contactless delivery'
  },
  {
    id: 'customer-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '555-987-6543',
    address: '456 Oak Ave, Somewhere, USA',
    registrationDate: new Date('2023-02-20'),
    totalOrders: 3,
    totalSpent: 178.25,
    notes: ''
  },
  {
    id: 'customer-3',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '555-567-8901',
    address: '789 Pine Rd, Elsewhere, USA',
    registrationDate: new Date('2023-03-10'),
    totalOrders: 8,
    totalSpent: 412.75,
    notes: 'VIP customer, always tips well'
  },
  {
    id: 'customer-4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '555-234-5678',
    registrationDate: new Date('2023-04-05'),
    totalOrders: 2,
    totalSpent: 97.30,
    notes: 'New customer'
  },
  {
    id: 'customer-5',
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    phone: '555-345-6789',
    address: '321 Cedar St, Nowhere, USA',
    registrationDate: new Date('2023-05-18'),
    totalOrders: 6,
    totalSpent: 325.40,
    notes: 'Prefers pickup over delivery'
  }
];

// Sample orders
export let orders: Order[] = [
  {
    id: 'order-1',
    items: [
      { ...products[0], quantity: 2 },
      { ...products[2], quantity: 1 }
    ],
    total: 11.99,
    tax: 1.20,
    status: 'completed',
    date: new Date('2023-05-18T14:30:00'),
    customerId: 'customer-1',
    customerName: 'John Doe',
    paymentMethod: 'credit-card',
    notes: ''
  },
  {
    id: 'order-2',
    items: [
      { ...products[1], quantity: 1 },
      { ...products[3], quantity: 2 }
    ],
    total: 13.47,
    tax: 1.35,
    status: 'pending',
    date: new Date('2023-05-19T10:15:00'),
    customerId: 'customer-2',
    customerName: 'Jane Smith',
    paymentMethod: 'cash',
    notes: 'Extra napkins requested'
  },
  {
    id: 'order-3',
    items: [
      { ...products[4], quantity: 1 }
    ],
    total: 5.99,
    tax: 0.60,
    status: 'completed',
    date: new Date('2023-05-19T16:45:00'),
    customerId: 'customer-3',
    customerName: 'Robert Johnson',
    paymentMethod: 'mobile-payment',
    notes: ''
  },
  {
    id: 'order-4',
    items: [
      { ...products[2], quantity: 2 },
      { ...products[5], quantity: 1 }
    ],
    total: 17.97,
    tax: 1.80,
    status: 'cancelled',
    date: new Date('2023-05-20T12:00:00'),
    customerId: 'customer-1',
    customerName: 'John Doe',
    paymentMethod: 'credit-card',
    notes: 'Customer changed mind'
  },
  {
    id: 'order-5',
    items: [
      { ...products[6], quantity: 1 },
      { ...products[7], quantity: 2 }
    ],
    total: 12.00,
    tax: 1.20,
    status: 'completed',
    date: new Date('2023-05-21T09:30:00'),
    customerName: 'Guest',
    paymentMethod: 'cash',
    notes: ''
  }
];

// Sample reports
export let reports: Report[] = [
  {
    id: 'report-1',
    name: 'Monthly Sales Report',
    type: 'sales',
    description: 'Summary of all sales for the current month',
    createdAt: new Date('2023-04-01'),
    lastRun: new Date('2023-05-01'),
    format: 'pdf',
    scheduled: true,
    scheduledFrequency: 'monthly'
  },
  {
    id: 'report-2',
    name: 'Inventory Status',
    type: 'inventory',
    description: 'Current inventory levels and restocking needs',
    createdAt: new Date('2023-04-15'),
    lastRun: new Date('2023-05-15'),
    format: 'excel',
    scheduled: false
  },
  {
    id: 'report-3',
    name: 'Top Customers',
    type: 'customers',
    description: 'List of top customers by sales volume',
    createdAt: new Date('2023-04-10'),
    lastRun: new Date('2023-05-10'),
    format: 'pdf',
    scheduled: true,
    scheduledFrequency: 'monthly'
  },
  {
    id: 'report-4',
    name: 'Daily Transactions',
    type: 'sales',
    description: 'Detailed list of all transactions for each day',
    createdAt: new Date('2023-05-01'),
    lastRun: new Date('2023-05-22'),
    format: 'csv',
    scheduled: true,
    scheduledFrequency: 'daily'
  }
];

// Sample settings
export let settings: Setting[] = [
  {
    id: 'setting-1',
    name: 'Store Name',
    value: 'My POS Store',
    category: 'general',
    description: 'Name of your store'
  },
  {
    id: 'setting-2',
    name: 'Tax Rate',
    value: '10',
    category: 'tax',
    description: 'Default tax rate percentage'
  },
  {
    id: 'setting-3',
    name: 'Receipt Footer Text',
    value: 'Thank you for your purchase!',
    category: 'printer',
    description: 'Text to display at the bottom of receipts'
  },
  {
    id: 'setting-4',
    name: 'Order Notification',
    value: 'true',
    category: 'notification',
    description: 'Send email notifications for new orders'
  },
  {
    id: 'setting-5',
    name: 'Session Timeout',
    value: '30',
    category: 'security',
    description: 'User session timeout in minutes'
  }
];

// Payment methods
export const paymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'credit-card', name: 'Credit Card' },
  { id: 'debit-card', name: 'Debit Card' },
  { id: 'mobile-payment', name: 'Mobile Payment' }
];

// Product CRUD operations
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newProduct = {
    ...product,
    id: `product-${Date.now()}`,
  };
  
  products = [...products, newProduct];
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  const updatedProduct = { ...products[index], ...updates };
  products = [
    ...products.slice(0, index),
    updatedProduct,
    ...products.slice(index + 1)
  ];
  
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  return products.length < initialLength;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

// Customer CRUD operations
export const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const newCustomer = {
    ...customer,
    id: `customer-${Date.now()}`,
  };
  
  customers = [...customers, newCustomer];
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updatedCustomer = { ...customers[index], ...updates };
  customers = [
    ...customers.slice(0, index),
    updatedCustomer,
    ...customers.slice(index + 1)
  ];
  
  return updatedCustomer;
};

export const deleteCustomer = (id: string): boolean => {
  const initialLength = customers.length;
  customers = customers.filter(c => c.id !== id);
  return customers.length < initialLength;
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(c => c.id === id);
};

// Order CRUD operations
export const addOrder = (order: Omit<Order, 'id'>): Order => {
  const newOrder = {
    ...order,
    id: `order-${Date.now()}`,
  };
  
  orders = [...orders, newOrder];
  return newOrder;
};

export const updateOrder = (id: string, updates: Partial<Order>): Order | null => {
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) return null;
  
  const updatedOrder = { ...orders[index], ...updates };
  orders = [
    ...orders.slice(0, index),
    updatedOrder,
    ...orders.slice(index + 1)
  ];
  
  return updatedOrder;
};

export const deleteOrder = (id: string): boolean => {
  const initialLength = orders.length;
  orders = orders.filter(o => o.id !== id);
  return orders.length < initialLength;
};

export const getOrderById = (id: string): Order | undefined => {
  return orders.find(o => o.id === id);
};

// Report CRUD operations
export const addReport = (report: Omit<Report, 'id'>): Report => {
  const newReport = {
    ...report,
    id: `report-${Date.now()}`,
  };
  
  reports = [...reports, newReport];
  return newReport;
};

export const updateReport = (id: string, updates: Partial<Report>): Report | null => {
  const index = reports.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const updatedReport = { ...reports[index], ...updates };
  reports = [
    ...reports.slice(0, index),
    updatedReport,
    ...reports.slice(index + 1)
  ];
  
  return updatedReport;
};

export const deleteReport = (id: string): boolean => {
  const initialLength = reports.length;
  reports = reports.filter(r => r.id !== id);
  return reports.length < initialLength;
};

export const getReportById = (id: string): Report | undefined => {
  return reports.find(r => r.id === id);
};

// Setting CRUD operations
export const updateSetting = (id: string, value: string): Setting | null => {
  const index = settings.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  const updatedSetting = { ...settings[index], value };
  settings = [
    ...settings.slice(0, index),
    updatedSetting,
    ...settings.slice(index + 1)
  ];
  
  return updatedSetting;
};

export const getSettingByName = (name: string): Setting | undefined => {
  return settings.find(s => s.name === name);
};

export const getSettingsByCategory = (category: Setting['category']): Setting[] => {
  return settings.filter(s => s.category === category);
};

