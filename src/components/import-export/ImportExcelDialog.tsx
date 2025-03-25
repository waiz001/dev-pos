
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { importProductsFromExcel, importCustomersFromExcel } from "@/utils/excelUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'products' | 'customers';
  onImportComplete?: () => void;
}

const ImportExcelDialog: React.FC<ImportExcelDialogProps> = ({
  open,
  onOpenChange,
  type,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    added: number;
    updated: number;
    errors: string[];
  } | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }
    
    setIsImporting(true);
    
    try {
      const result = type === 'products'
        ? await importProductsFromExcel(file)
        : await importCustomersFromExcel(file);
      
      setImportResult(result);
      
      if (result.errors.length === 0) {
        toast.success(`Successfully imported ${result.added} new items and updated ${result.updated} existing items.`);
        if (onImportComplete) onImportComplete();
      } else {
        toast.warning(`Import completed with ${result.errors.length} errors.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Failed to import ${type}: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setImportResult(null);
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import {type === 'products' ? 'Products' : 'Customers'}</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import {type === 'products' ? 'products' : 'customers'}.
            Make sure your file follows the template format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="dropzone-file" 
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-primary/20 bg-background hover:bg-primary/5"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Excel files only (.xlsx)
                </p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                accept=".xlsx" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </label>
          </div>
          
          {file && (
            <div className="mt-4">
              <p className="text-sm">Selected file: <span className="font-medium">{file.name}</span></p>
            </div>
          )}
          
          {importResult && importResult.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="mt-2">
                  <p>Import completed with {importResult.errors.length} errors:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs">
                    {importResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 3 && (
                      <li>...and {importResult.errors.length - 3} more errors</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {importResult && (
            <div className="mt-4 text-sm">
              <p>Successfully added: <span className="font-medium">{importResult.added}</span></p>
              <p>Successfully updated: <span className="font-medium">{importResult.updated}</span></p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {isImporting ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </Button>
          ) : (
            <Button onClick={handleImport} disabled={!file}>
              Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelDialog;
