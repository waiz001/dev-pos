import { v4 as uuidv4 } from "uuid";

export interface Category {
  id: string;
  name: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
  registrationDate?: Date;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image: string;
  barcode?: string;
  inStock: number;
  storeId?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  date: Date;
  total: number;
  tax?: number;
  paymentMethod: string;
  notes?: string;
  status: "completed" | "pending" | "cancelled" | "in-progress";
  storeId?: string;
}

export interface Report {
  id: string;
  name: string;
  type: "sales" | "inventory" | "customers" | "custom";
  description: string;
  format: "pdf" | "excel" | "csv";
  createdAt: Date;
  lastRun?: Date;
  scheduled: boolean;
  scheduledFrequency?: "daily" | "weekly" | "monthly" | null;
}

export interface Setting {
  id: string;
  name: string;
  value: string;
  category: "general" | "payment" | "tax" | "printer" | "notification" | "security";
  description: string;
}

export const categories: Category[] = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "drinks",
    name: "Drinks",
  },
  {
    id: "food",
    name: "Food",
  },
  {
    id: "desserts",
    name: "Desserts",
  },
  {
    id: "electronics",
    name: "Electronics",
  },
  {
    id: "clothing",
    name: "Clothing",
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "Cash",
  },
  {
    id: "credit-card",
    name: "Credit Card",
  },
];

export const stores = [
  {
    id: "store-1",
    name: "Main Store",
    address: "123 Main Street, Anytown",
    phone: "+1 (555) 123-4567",
    hours: "9:00 AM - 9:00 PM",
    employees: 5,
    image: "https://images.unsplash.com/photo-1582539511848-55707aee0625?auto=format&fit=crop&q=80&w=500&h=300"
  },
  {
    id: "store-2",
    name: "Downtown Branch",
    address: "456 Commerce Ave, Downtown",
    phone: "+1 (555) 987-6543",
    hours: "8:00 AM - 8:00 PM",
    employees: 3,
    image: "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&q=80&w=500&h=300"
  },
  {
    id: "store-3",
    name: "Shopping Mall Kiosk",
    address: "789 Mall Plaza, Shop #42",
    phone: "+1 (555) 456-7890",
    hours: "10:00 AM - 10:00 PM",
    employees: 2,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=500&h=300"
  }
];

export let products: Product[] = [
  {
    id: "product-1",
    name: "Latte",
    price: 3.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1517256054524-a7214ca2af9e?q=80&w=200&h=200&auto=format&fit=crop",
    inStock: 50,
  },
  {
    id: "product-2",
    name: "Burger",
    price: 8.99,
    category: "food",
    image: "https://images.unsplash.com/photo-1568901342037-24c7e8a8c50f?q=80&w=200&h=200&auto=format&fit=crop",
    inStock: 30,
  },
  {
    id: "product-3",
    name: "Ice Cream",
    price: 4.25,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1563720239742-9fa9c91e584c?q=80&w=200&h=200&auto=format&fit=crop",
    inStock: 40,
  },
  {
    id: "product-4",
    name: "Headphones",
    price: 79.00,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&h=200&auto=format&fit=crop",
    inStock: 20,
  },
  {
    id: "product-5",
    name: "T-Shirt",
    price: 19.99,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1523381294911-8cd694c82c4c?q=80&w=200&h=200&auto=format&fit=crop",
    inStock: 60,
  },
];

export let customers: Customer[] = [
  {
    id: "customer-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-1234",
    address: "123 Main St",
  },
  {
    id: "customer-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555-5678",
    address: "456 Elm St",
  },
];

export let orders: Order[] = [
  {
    id: "order-1",
    customerId: "customer-1",
    customerName: "John Doe",
    items: [
      {
        id: "product-1",
        name: "Latte",
        price: 3.5,
        image: "https://images.unsplash.com/photo-1517256054524-a7214ca2af9e?q=80&w=200&h=200&auto=format&fit=crop",
        quantity: 2,
      },
      {
        id: "product-2",
        name: "Burger",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1568901342037-24c7e8a8c50f?q=80&w=200&h=200&auto=format&fit=crop",
        quantity: 1,
      },
    ],
    date: new Date(),
    total: 16.99,
    paymentMethod: "cash",
    status: "completed",
  },
  {
    id: "order-2",
    customerId: "customer-2",
    customerName: "Jane Smith",
    items: [
      {
        id: "product-3",
        name: "Ice Cream",
        price: 4.25,
        image: "https://images.unsplash.com/photo-1563720239742-9fa9c91e584c?q=80&w=200&h=200&auto=format&fit=crop",
        quantity: 3,
      },
    ],
    date: new Date(),
    total: 12.75,
    paymentMethod: "credit-card",
    status: "pending",
  },
];

export let reports: Report[] = [
  {
    id: "report-1",
    name: "Daily Sales Report",
    type: "sales",
    description: "Daily sales summary with payment method breakdown",
    format: "pdf",
    createdAt: new Date(),
    scheduled: true,
    scheduledFrequency: "daily"
  },
  {
    id: "report-2",
    name: "Inventory Status",
    type: "inventory",
    description: "Current inventory levels and low stock alerts",
    format: "excel",
    createdAt: new Date(),
    scheduled: true,
    scheduledFrequency: "weekly"
  },
  {
    id: "report-3",
    name: "Customer Analytics",
    type: "customers",
    description: "Customer spending habits and frequency",
    format: "pdf",
    createdAt: new Date(),
    scheduled: false
  }
];

export let settings: Setting[] = [
  {
    id: "setting-1",
    name: "Store Name",
    value: "My POS Store",
    category: "general",
    description: "Name of your store displayed on receipts"
  },
  {
    id: "setting-2",
    name: "Tax Rate",
    value: "8.5",
    category: "tax",
    description: "Default sales tax percentage"
  },
  {
    id: "setting-3",
    name: "Email Notifications",
    value: "true",
    category: "notification",
    description: "Send email notifications for new orders"
  }
];

export const addProduct = (productData: Partial<Product>): Product => {
  const newProduct: Product = {
    id: uuidv4(),
    name: productData.name || "New Product",
    price: productData.price || 10,
    category: productData.category || "food",
    description: productData.description || "",
    image: productData.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&h=200&auto=format&fit=crop",
    barcode: productData.barcode || "",
    inStock: productData.inStock || 100,
    storeId: productData.storeId || "",
  };
  products.push(newProduct);
  return newProduct;
};

export const getProduct = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const updateProduct = (id: string, productData: Partial<Product>): Product | null => {
  const productIndex = products.findIndex((product) => product.id === id);
  if (productIndex === -1) {
    return null;
  }

  products[productIndex] = {
    ...products[productIndex],
    ...productData,
  };

  return products[productIndex];
};

export const deleteProduct = (id: string): boolean => {
  const productIndex = products.findIndex((product) => product.id === id);
  if (productIndex === -1) {
    return false;
  }

  products.splice(productIndex, 1);
  return true;
};

export const addCustomer = (customerData: Omit<Customer, "id">): Customer => {
  const newCustomer: Customer = {
    id: uuidv4(),
    ...customerData,
  };
  customers.push(newCustomer);
  return newCustomer;
};

export const getCustomer = (id: string): Customer | undefined => {
  return customers.find((customer) => customer.id === id);
};

export const updateCustomer = (id: string, customerData: Partial<Customer>): Customer | null => {
  const customerIndex = customers.findIndex((customer) => customer.id === id);
  if (customerIndex === -1) {
    return null;
  }

  customers[customerIndex] = {
    ...customers[customerIndex],
    ...customerData,
  };

  return customers[customerIndex];
};

export const deleteCustomer = (id: string): boolean => {
  const customerIndex = customers.findIndex((customer) => customer.id === id);
  if (customerIndex === -1) {
    return false;
  }

  customers.splice(customerIndex, 1);
  return true;
};

export const addOrder = (orderData: Omit<Order, "id">): Order => {
  const newOrder: Order = {
    id: uuidv4(),
    ...orderData,
  };
  orders.push(newOrder);
  return newOrder;
};

export const getOrder = (id: string): Order | undefined => {
  return orders.find((order) => order.id === id);
};

export const updateOrder = (id: string, orderData: Partial<Order>): Order | null => {
  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex === -1) {
    return null;
  }

  orders[orderIndex] = {
    ...orders[orderIndex],
    ...orderData,
  };

  return orders[orderIndex];
};

export const deleteOrder = (id: string): boolean => {
  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex === -1) {
    return false;
  }

  orders.splice(orderIndex, 1);
  return true;
};

export const addReport = (reportData: Omit<Report, "id" | "createdAt">): Report => {
  const newReport: Report = {
    id: uuidv4(),
    ...reportData,
    createdAt: new Date()
  };
  reports.push(newReport);
  return newReport;
};

export const getReport = (id: string): Report | undefined => {
  return reports.find((report) => report.id === id);
};

export const updateReport = (id: string, reportData: Partial<Report>): Report | null => {
  const reportIndex = reports.findIndex((report) => report.id === id);
  if (reportIndex === -1) {
    return null;
  }

  reports[reportIndex] = {
    ...reports[reportIndex],
    ...reportData,
  };

  return reports[reportIndex];
};

export const deleteReport = (id: string): boolean => {
  const reportIndex = reports.findIndex((report) => report.id === id);
  if (reportIndex === -1) {
    return false;
  }

  reports.splice(reportIndex, 1);
  return true;
};

export const getSettingsByCategory = (category: Setting["category"]): Setting[] => {
  return settings.filter(setting => setting.category === category);
};

export const getSetting = (id: string): Setting | undefined => {
  return settings.find((setting) => setting.id === id);
};

export const updateSetting = (id: string, settingData: Partial<Setting>): Setting | null => {
  const settingIndex = settings.findIndex((setting) => setting.id === id);
  if (settingIndex === -1) {
    return null;
  }

  settings[settingIndex] = {
    ...settings[settingIndex],
    ...settingData,
  };

  return settings[settingIndex];
};

export const addSetting = (settingData: Omit<Setting, "id">): Setting => {
  const newSetting: Setting = {
    id: uuidv4(),
    ...settingData,
  };
  settings.push(newSetting);
  return newSetting;
};

export const deleteSetting = (id: string): boolean => {
  const settingIndex = settings.findIndex((setting) => setting.id === id);
  if (settingIndex === -1) {
    return false;
  }

  settings.splice(settingIndex, 1);
  return true;
};

export const getOrderById = getOrder;

export const generateProductTemplate = () => {
  return {
    headers: ["name", "price", "category", "description", "barcode", "inStock", "storeId", "image"],
    data: [
      ["Sample Product", "9.99", "electronics", "Sample description", "12345678", "100", "store-1", "https://example.com/image.jpg"]
    ]
  };
};

export const generateCustomerTemplate = () => {
  return {
    headers: ["name", "email", "phone", "address", "notes"],
    data: [
      ["John Doe", "john@example.com", "555-123-4567", "123 Main St, Anytown", "VIP customer"]
    ]
  };
};
