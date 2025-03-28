
/**
 * Generate Products Template for Excel Import
 */
export const generateProductsTemplate = () => {
  const headers = ["name", "price", "category", "description", "barcode", "inStock", "storeId", "image"];
  const sampleProduct = {
    name: "Sample Product",
    price: 9.99,
    category: "electronics",
    description: "Sample description",
    barcode: "123456789",
    inStock: 100,
    storeId: "store-1",
    image: "https://example.com/image.jpg"
  };
  
  return { headers, data: [Object.values(sampleProduct)] };
};

/**
 * Generate Customers Template for Excel Import
 */
export const generateCustomersTemplate = () => {
  const headers = ["name", "email", "phone", "address", "notes"];
  const sampleCustomer = {
    name: "John Doe",
    email: "john@example.com", 
    phone: "555-123-4567",
    address: "123 Main St, Anytown",
    notes: "Sample customer notes"
  };
  
  return { headers, data: [Object.values(sampleCustomer)] };
};
