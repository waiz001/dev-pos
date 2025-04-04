
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, Product } from "@/utils/data";

// Extend jsPDF types to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Flexible receipt data type that works with both direct Order objects 
// and the structured format with order property
export interface ReceiptData {
  storeName?: string;
  order?: Order;
  id?: string;
  date?: Date;
  items?: Array<any>;
  total?: number;
  tax?: number;
  customerId?: string;
  customerName?: string;
  paymentMethod?: string;
  notes?: string;
  status?: "completed" | "pending" | "cancelled" | "in-progress";
  storeId?: string;
  isMerchantCopy?: boolean;
  customer?: {
    name: string;
    [key: string]: any;
  };
  taxRate?: number;
}

// Type for sales report PDF generation
export interface SalesReportData {
  title: string;
  orders: Order[];
  startDate?: string;
  endDate?: string;
  totals: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    paymentMethods?: Record<string, number>;
    topProducts?: Array<{
      name: string;
      quantity: number;
      total: number;
    }>;
  };
}

// Type for order PDF generation
export interface OrderPdfData extends Order {
  isMerchantCopy?: boolean;
}
