import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, categories, stores } from '@/utils/data';

// Template for products import
export const generateProductsTemplate = () => {
  // Define the headers and sample data for product import template
  return {
    headers: ["name", "price", "category", "description", "barcode", "inStock", "storeId", "image"],
    data: [
      ["Sample Product", "9.99", "electronics", "Sample description", "12345678", "100", "store-1", "https://example.com/image.jpg"]
    ]
  };
};

// PDF template for product catalog
export const generateProductCatalogPdf = (products: Product[]): jsPDF => {
  const doc = new jsPDF();
  
  // Add the title
  doc.setFontSize(18);
  doc.text("Product Catalog", 14, 22);
  
  // Add date generated
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Prepare table data
  const tableHeaders = ["Name", "Category", "Price", "In Stock", "Barcode"];
  
  const tableData = products.map((product) => {
    // Find category name
    const category = categories.find(c => c.id === product.category);
    // Find store name if applicable
    const store = product.storeId ? stores.find(s => s.id === product.storeId) : null;
    
    return [
      product.name,
      category ? category.name : 'N/A',
      `$${product.price.toFixed(2)}`,
      product.inStock.toString(),
      product.barcode || 'N/A'
    ];
  });
  
  // Use autoTable with configuration object syntax
  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  return doc;
};

// Template for customers import
export const generateCustomersTemplate = () => {
  return {
    headers: ["name", "email", "phone", "address", "notes"],
    data: [
      ["John Doe", "john@example.com", "555-123-4567", "123 Main St, Anytown", "VIP customer"]
    ]
  };
};
