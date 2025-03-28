
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF types to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
    };
  }
}
