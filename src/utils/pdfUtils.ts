
// Re-export all PDF utilities from their specific modules
export * from "./pdf";

// Alias exports for backward compatibility
import { generateReceiptPdf as genReceiptPdf } from "./pdf/receiptPdf";
import { generateSalesReportPdf as genSalesReportPdf, generateDailySalesReportPDF as genDailyReportPdf } from "./pdf/salesReportPdf";

export const generateOrderReceiptPDF = genReceiptPdf;
export const generateDailySalesReportPDF = genDailyReportPdf;
