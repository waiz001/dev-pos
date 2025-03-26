
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut } from "lucide-react";

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfDocument: any; // jsPDF document
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  filename?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfDocument,
  open,
  onOpenChange,
  title = "PDF Document",
  filename = "document.pdf"
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const previousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };
  
  const nextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };
  
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };
  
  const handleDownload = () => {
    if (pdfDocument) {
      try {
        pdfDocument.save(filename);
        console.log("PDF downloaded successfully");
      } catch (error) {
        console.error('Error downloading PDF:', error);
        setError("Failed to download PDF. Please try again.");
      }
    }
  };
  
  // Generate PDF data URL when dialog opens
  React.useEffect(() => {
    if (open && pdfDocument) {
      try {
        setError(null);
        const dataUrl = pdfDocument.output('dataurlstring');
        setPdfUrl(dataUrl);
      } catch (error) {
        console.error('Error generating PDF URL:', error);
        setError("Failed to generate PDF preview.");
      }
    } else {
      setPdfUrl(null);
      setPageNumber(1);
      setError(null);
    }
  }, [open, pdfDocument]);
  
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-muted/20 rounded-md">
          {error ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : pdfUrl ? (
            <div className="h-full flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              )}
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('Error loading PDF:', error);
                  setError("Failed to load PDF document.");
                }}
                className="pdf-document"
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={zoomOut} size="sm" variant="outline">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={zoomIn} size="sm" variant="outline">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={previousPage} 
                  disabled={pageNumber <= 1} 
                  size="sm" 
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous Page</TooltipContent>
            </Tooltip>
            
            <span className="text-sm">
              {pageNumber} / {numPages || 1}
            </span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={nextPage} 
                  disabled={pageNumber >= (numPages || 1)} 
                  size="sm" 
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next Page</TooltipContent>
            </Tooltip>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleDownload} variant="default">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download PDF</TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
