
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

// Type for receipt PDF generation
export interface ReceiptData {
  storeName: string;
  order: Order;
  customer?: {
    name: string;
    [key: string]: any;
  };
  taxRate?: number;
  notes?: string;
  isMerchantCopy?: boolean;
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
