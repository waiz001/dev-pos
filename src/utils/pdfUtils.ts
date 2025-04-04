
// Re-export all PDF utilities from their specific modules
export * from "./pdf";

// Alias exports for backward compatibility (these will match the names used in the components)
export { generateReceiptPdf as generateOrderReceiptPDF } from "./pdf/receiptPdf";
export { generateDailySalesReportPDF } from "./pdf/salesReportPdf";
