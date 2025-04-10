
import { 
  supabase, 
} from '@/integrations/supabase/client';
import {
  TABLES
} from './supabase';
import { 
  products, 
  customers, 
  orders, 
  categories, 
  paymentMethods, 
  stores, 
  settings,
  Order,
  Customer,
  Product,
  Category,
  PaymentMethod,
  Setting,
  CartItem
} from './data';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert camelCase to snake_case for Supabase
const toSnakeCase = (str: string) => 
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const fromSnakeCase = (str: string) => 
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const convertToSnakeCase = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = obj[key];
    }
  }
  
  return result;
};

const convertToCamelCase = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = fromSnakeCase(key);
      result[camelKey] = obj[key];
    }
  }
  
  return result;
};

// Database migration functions
export const migrateProducts = async () => {
  try {
    for (const product of products) {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description || null,
          image: product.image,
          barcode: product.barcode || null,
          in_stock: product.inStock,
          store_id: product.storeId || null,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating products:', error);
    return { success: false, error };
  }
};

export const migrateCustomers = async () => {
  try {
    for (const customer of customers) {
      const { error } = await supabase
        .from(TABLES.CUSTOMERS)
        .upsert({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes || null,
          total_orders: customer.totalOrders || 0,
          total_spent: customer.totalSpent || 0,
          registration_date: (customer.registrationDate || new Date()).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating customers:', error);
    return { success: false, error };
  }
};

export const migrateOrders = async () => {
  try {
    for (const order of orders) {
      // First insert the order
      const { error: orderError } = await supabase
        .from(TABLES.ORDERS)
        .upsert({
          id: order.id,
          customer_id: order.customerId || null,
          customer_name: order.customerName || null,
          date: order.date.toISOString(),
          total: order.total,
          tax: order.tax || null,
          payment_method: order.paymentMethod,
          notes: order.notes || null,
          status: order.status,
          store_id: order.storeId || null,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (orderError) throw orderError;
      
      // Then insert all the order items
      for (const item of order.items) {
        const { error: itemError } = await supabase
          .from(TABLES.ORDER_ITEMS)
          .upsert({
            id: uuidv4(),
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            created_at: new Date().toISOString(),
            updated_at: null
          });
        
        if (itemError) throw itemError;
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating orders:', error);
    return { success: false, error };
  }
};

export const migrateCategories = async () => {
  try {
    for (const category of categories) {
      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .upsert({
          id: category.id,
          name: category.name,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating categories:', error);
    return { success: false, error };
  }
};

export const migratePaymentMethods = async () => {
  try {
    for (const method of paymentMethods) {
      const { error } = await supabase
        .from(TABLES.PAYMENT_METHODS)
        .upsert({
          id: method.id,
          name: method.name,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating payment methods:', error);
    return { success: false, error };
  }
};

export const migrateStores = async () => {
  try {
    for (const store of stores) {
      const { error } = await supabase
        .from(TABLES.STORES)
        .upsert({
          id: store.id,
          name: store.name,
          address: store.address,
          phone: store.phone,
          hours: store.hours,
          employees: store.employees,
          image: store.image || null,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating stores:', error);
    return { success: false, error };
  }
};

export const migrateSettings = async () => {
  try {
    for (const setting of settings) {
      const { error } = await supabase
        .from(TABLES.SETTINGS)
        .upsert({
          id: setting.id,
          name: setting.name,
          value: setting.value,
          category: setting.category,
          description: setting.description,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error migrating settings:', error);
    return { success: false, error };
  }
};

// Data sync functions
export const syncAllDataToSupabase = async () => {
  try {
    await migrateProducts();
    await migrateCustomers();
    await migrateCategories();
    await migratePaymentMethods();
    await migrateStores();
    await migrateSettings();
    await migrateOrders(); // Orders should be last because they depend on products and customers
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing data to Supabase:', error);
    return { success: false, error };
  }
};

// Functions to fetch data from Supabase
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return (data || []).map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    description: product.description || undefined,
    image: product.image,
    barcode: product.barcode || undefined,
    inStock: product.in_stock,
    storeId: product.store_id || undefined,
  }));
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .select('*');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return (data || []).map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes || undefined,
    totalOrders: customer.total_orders || undefined,
    totalSpent: customer.total_spent || undefined,
    registrationDate: customer.registration_date ? new Date(customer.registration_date) : undefined,
  }));
};

export const fetchOrders = async (): Promise<Order[]> => {
  const { data: ordersData, error: ordersError } = await supabase
    .from(TABLES.ORDERS)
    .select('*');
  
  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return [];
  }
  
  const orders: Order[] = [];
  
  for (const order of (ordersData || [])) {
    // Fetch order items for this order
    const { data: itemsData, error: itemsError } = await supabase
      .from(TABLES.ORDER_ITEMS)
      .select('*')
      .eq('order_id', order.id);
    
    if (itemsError) {
      console.error(`Error fetching items for order ${order.id}:`, itemsError);
      continue;
    }
    
    const items: CartItem[] = (itemsData || []).map(item => ({
      id: item.product_id,
      name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      image: '', // We don't store image in order_items table, would need to join with products
    }));
    
    orders.push({
      id: order.id,
      customerId: order.customer_id || undefined,
      customerName: order.customer_name || undefined,
      date: new Date(order.date),
      total: order.total,
      tax: order.tax || undefined,
      paymentMethod: order.payment_method,
      notes: order.notes || undefined,
      status: order.status as "completed" | "pending" | "cancelled" | "in-progress",
      storeId: order.store_id || undefined,
      items: items,
    });
  }
  
  return orders;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIES)
    .select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
  }));
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from(TABLES.PAYMENT_METHODS)
    .select('*');
  
  if (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
  
  return (data || []).map(method => ({
    id: method.id,
    name: method.name,
  }));
};

export const fetchSettings = async (): Promise<Setting[]> => {
  const { data, error } = await supabase
    .from(TABLES.SETTINGS)
    .select('*');
  
  if (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
  
  return (data || []).map(setting => ({
    id: setting.id,
    name: setting.name,
    value: setting.value,
    category: setting.category as any,
    description: setting.description,
  }));
};

// CRUD operations for each data type
// Products
export const addProductToSupabase = async (productData: Omit<Product, "id">): Promise<Product | null> => {
  const id = uuidv4();
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .insert({
      id,
      name: productData.name,
      price: productData.price,
      category: productData.category,
      description: productData.description || null,
      image: productData.image,
      barcode: productData.barcode || null,
      in_stock: productData.inStock,
      store_id: productData.storeId || null,
      created_at: new Date().toISOString(),
      updated_at: null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    return null;
  }
  
  return data ? {
    id: data.id,
    name: data.name,
    price: data.price,
    category: data.category,
    description: data.description || undefined,
    image: data.image,
    barcode: data.barcode || undefined,
    inStock: data.in_stock,
    storeId: data.store_id || undefined,
  } : null;
};

export const updateProductInSupabase = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
  const updateData: any = {};
  
  if (productData.name !== undefined) updateData.name = productData.name;
  if (productData.price !== undefined) updateData.price = productData.price;
  if (productData.category !== undefined) updateData.category = productData.category;
  if (productData.description !== undefined) updateData.description = productData.description;
  if (productData.image !== undefined) updateData.image = productData.image;
  if (productData.barcode !== undefined) updateData.barcode = productData.barcode;
  if (productData.inStock !== undefined) updateData.in_stock = productData.inStock;
  if (productData.storeId !== undefined) updateData.store_id = productData.storeId;
  
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    return null;
  }
  
  return data ? {
    id: data.id,
    name: data.name,
    price: data.price,
    category: data.category,
    description: data.description || undefined,
    image: data.image,
    barcode: data.barcode || undefined,
    inStock: data.in_stock,
    storeId: data.store_id || undefined,
  } : null;
};

export const deleteProductFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.PRODUCTS)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  
  return true;
};

// Customers
export const addCustomerToSupabase = async (customerData: Omit<Customer, "id">): Promise<Customer | null> => {
  const id = uuidv4();
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .insert({
      id,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      notes: customerData.notes || null,
      total_orders: customerData.totalOrders || 0,
      total_spent: customerData.totalSpent || 0,
      registration_date: (customerData.registrationDate || new Date()).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding customer:', error);
    return null;
  }
  
  return data ? {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes || undefined,
    totalOrders: data.total_orders || undefined,
    totalSpent: data.total_spent || undefined,
    registrationDate: data.registration_date ? new Date(data.registration_date) : undefined,
  } : null;
};

export const updateCustomerInSupabase = async (id: string, customerData: Partial<Customer>): Promise<Customer | null> => {
  const updateData: any = {};
  
  if (customerData.name !== undefined) updateData.name = customerData.name;
  if (customerData.email !== undefined) updateData.email = customerData.email;
  if (customerData.phone !== undefined) updateData.phone = customerData.phone;
  if (customerData.address !== undefined) updateData.address = customerData.address;
  if (customerData.notes !== undefined) updateData.notes = customerData.notes;
  if (customerData.totalOrders !== undefined) updateData.total_orders = customerData.totalOrders;
  if (customerData.totalSpent !== undefined) updateData.total_spent = customerData.totalSpent;
  if (customerData.registrationDate !== undefined) updateData.registration_date = customerData.registrationDate.toISOString();
  
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating customer:', error);
    return null;
  }
  
  return data ? {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes || undefined,
    totalOrders: data.total_orders || undefined,
    totalSpent: data.total_spent || undefined,
    registrationDate: data.registration_date ? new Date(data.registration_date) : undefined,
  } : null;
};

export const deleteCustomerFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.CUSTOMERS)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
  
  return true;
};

// Orders
export const addOrderToSupabase = async (orderData: Omit<Order, "id">): Promise<Order | null> => {
  // Start a transaction
  const id = uuidv4();
  
  // Insert the order
  const { data: orderData1, error: orderError } = await supabase
    .from(TABLES.ORDERS)
    .insert({
      id,
      customer_id: orderData.customerId || null,
      customer_name: orderData.customerName || null,
      date: orderData.date.toISOString(),
      total: orderData.total,
      tax: orderData.tax || null,
      payment_method: orderData.paymentMethod,
      notes: orderData.notes || null,
      status: orderData.status,
      store_id: orderData.storeId || null,
      created_at: new Date().toISOString(),
      updated_at: null
    })
    .select()
    .single();
  
  if (orderError) {
    console.error('Error adding order:', orderError);
    return null;
  }
  
  // Insert the order items
  for (const item of orderData.items) {
    const { error: itemError } = await supabase
      .from(TABLES.ORDER_ITEMS)
      .insert({
        id: uuidv4(),
        order_id: id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        created_at: new Date().toISOString(),
        updated_at: null
      });
    
    if (itemError) {
      console.error(`Error adding item for order ${id}:`, itemError);
      // Ideally we would rollback the transaction here, but Supabase doesn't support transactions in the client
    }
  }
  
  // Return the order with items
  return {
    id,
    customerId: orderData.customerId,
    customerName: orderData.customerName,
    date: orderData.date,
    total: orderData.total,
    tax: orderData.tax,
    paymentMethod: orderData.paymentMethod,
    notes: orderData.notes,
    status: orderData.status,
    storeId: orderData.storeId,
    items: orderData.items
  };
};

export const updateOrderInSupabase = async (id: string, orderData: Partial<Order>): Promise<Order | null> => {
  const updateData: any = {};
  
  if (orderData.customerId !== undefined) updateData.customer_id = orderData.customerId;
  if (orderData.customerName !== undefined) updateData.customer_name = orderData.customerName;
  if (orderData.date !== undefined) updateData.date = orderData.date.toISOString();
  if (orderData.total !== undefined) updateData.total = orderData.total;
  if (orderData.tax !== undefined) updateData.tax = orderData.tax;
  if (orderData.paymentMethod !== undefined) updateData.payment_method = orderData.paymentMethod;
  if (orderData.notes !== undefined) updateData.notes = orderData.notes;
  if (orderData.status !== undefined) updateData.status = orderData.status;
  if (orderData.storeId !== undefined) updateData.store_id = orderData.storeId;
  
  updateData.updated_at = new Date().toISOString();
  
  // Update the order
  const { data, error } = await supabase
    .from(TABLES.ORDERS)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order:', error);
    return null;
  }
  
  // If we have new items, update them
  if (orderData.items !== undefined) {
    // First delete all existing items
    const { error: deleteError } = await supabase
      .from(TABLES.ORDER_ITEMS)
      .delete()
      .eq('order_id', id);
    
    if (deleteError) {
      console.error(`Error deleting items for order ${id}:`, deleteError);
    }
    
    // Then insert the new items
    for (const item of orderData.items) {
      const { error: itemError } = await supabase
        .from(TABLES.ORDER_ITEMS)
        .insert({
          id: uuidv4(),
          order_id: id,
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          created_at: new Date().toISOString(),
          updated_at: null
        });
      
      if (itemError) {
        console.error(`Error updating item for order ${id}:`, itemError);
      }
    }
  }
  
  // Fetch the order items
  const { data: itemsData, error: itemsError } = await supabase
    .from(TABLES.ORDER_ITEMS)
    .select('*')
    .eq('order_id', id);
  
  if (itemsError) {
    console.error(`Error fetching items for updated order ${id}:`, itemsError);
    return null;
  }
  
  const items: CartItem[] = (itemsData || []).map(item => ({
    id: item.product_id,
    name: item.product_name,
    price: item.price,
    quantity: item.quantity,
    image: '', // Again, we would need a join with products
  }));
  
  return data ? {
    id: data.id,
    customerId: data.customer_id || undefined,
    customerName: data.customer_name || undefined,
    date: new Date(data.date),
    total: data.total,
    tax: data.tax || undefined,
    paymentMethod: data.payment_method,
    notes: data.notes || undefined,
    status: data.status as "completed" | "pending" | "cancelled" | "in-progress",
    storeId: data.store_id || undefined,
    items: items,
  } : null;
};

export const deleteOrderFromSupabase = async (id: string): Promise<boolean> => {
  // First delete all the order items
  const { error: itemsError } = await supabase
    .from(TABLES.ORDER_ITEMS)
    .delete()
    .eq('order_id', id);
  
  if (itemsError) {
    console.error(`Error deleting items for order ${id}:`, itemsError);
    return false;
  }
  
  // Then delete the order
  const { error } = await supabase
    .from(TABLES.ORDERS)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting order:', error);
    return false;
  }
  
  return true;
};

// Create a data migration UI component
export const createMigrationScript = async () => {
  try {
    await syncAllDataToSupabase();
    return { success: true };
  } catch (error) {
    console.error('Error running migration script:', error);
    return { success: false, error };
  }
};
