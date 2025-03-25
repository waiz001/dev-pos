import * as XLSX from 'xlsx';
import { Product, Customer, addProduct, updateProduct, addCustomer, updateCustomer } from './data';

/**
 * Export data to Excel file
 */
export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Create a sample Excel template for products
 */
export const downloadProductsTemplate = () => {
  const sampleData = [
    {
      id: '', // Leave blank for new products
      name: 'Sample Product',
      price: 9.99,
      category: 'drinks', // Use existing category ID
      description: 'Product description',
      barcode: '123456789',
      inStock: 100,
      image: 'https://example.com/image.jpg' // Optional
    }
  ];
  
  exportToExcel(sampleData, 'products_template');
};

/**
 * Create a sample Excel template for customers
 */
export const downloadCustomersTemplate = () => {
  const sampleData = [
    {
      id: '', // Leave blank for new customers
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      address: '123 Main St, Anytown, USA',
      notes: 'Regular customer'
    }
  ];
  
  exportToExcel(sampleData, 'customers_template');
};

/**
 * Import products from Excel file
 */
export const importProductsFromExcel = async (file: File): Promise<{ 
  added: number, 
  updated: number, 
  errors: string[] 
}> => {
  const result = { added: 0, updated: 0, errors: [] };
  
  try {
    const data = await readExcelFile(file);
    
    for (const row of data) {
      try {
        // Validate required fields
        if (!row.name || row.price === undefined) {
          result.errors.push(`Missing required fields for product: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Convert price to number
        const price = typeof row.price === 'number' ? row.price : parseFloat(row.price);
        if (isNaN(price)) {
          result.errors.push(`Invalid price for product: ${row.name}`);
          continue;
        }
        
        // Convert inStock to number
        const inStock = typeof row.inStock === 'number' ? row.inStock : parseInt(row.inStock);
        
        // Prepare product data
        const productData: Product = {
          id: row.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: row.name,
          price: price,
          category: row.category || 'general',
          description: row.description || '',
          barcode: row.barcode || '',
          inStock: isNaN(inStock) ? 0 : inStock,
          image: row.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&h=200&auto=format&fit=crop'
        };
        
        // Update existing product or add new one
        if (row.id) {
          const updated = updateProduct(row.id, productData);
          if (updated) {
            result.updated++;
          } else {
            result.errors.push(`Failed to update product: ${row.name}`);
          }
        } else {
          addProduct(productData);
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Error processing product: ${row.name}, ${error.message}`);
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to import products: ${error.message}`);
  }
};

/**
 * Import customers from Excel file
 */
export const importCustomersFromExcel = async (file: File): Promise<{ 
  added: number, 
  updated: number, 
  errors: string[] 
}> => {
  const result = { added: 0, updated: 0, errors: [] };
  
  try {
    const data = await readExcelFile(file);
    
    for (const row of data) {
      try {
        // Validate required fields
        if (!row.name) {
          result.errors.push(`Missing required name field for customer: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Prepare customer data
        const customerData: Customer = {
          id: row.id || `customer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: row.name,
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          notes: row.notes || '',
          registrationDate: new Date(),
          totalOrders: 0,
          totalSpent: 0
        };
        
        // Update existing customer or add new one
        if (row.id) {
          // Keep existing totalOrders and totalSpent for updates
          const existingCustomer = customers.find(c => c.id === row.id);
          if (existingCustomer) {
            customerData.totalOrders = existingCustomer.totalOrders;
            customerData.totalSpent = existingCustomer.totalSpent;
          }
          
          const updated = updateCustomer(row.id, customerData);
          if (updated) {
            result.updated++;
          } else {
            result.errors.push(`Failed to update customer: ${row.name}`);
          }
        } else {
          addCustomer(customerData);
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Error processing customer: ${row.name || 'Unknown'}, ${error.message}`);
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to import customers: ${error.message}`);
  }
};

/**
 * Export all products to Excel
 */
export const exportProductsToExcel = () => {
  // Import and use local data
  const { products } = require('./data');
  exportToExcel(products, 'products_export');
};

/**
 * Export all customers to Excel
 */
export const exportCustomersToExcel = () => {
  // Import and use local data
  const { customers } = require('./data');
  exportToExcel(customers, 'customers_export');
};

/**
 * Read Excel file and convert to array of objects
 */
const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
