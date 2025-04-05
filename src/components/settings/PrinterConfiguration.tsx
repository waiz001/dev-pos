
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Printer, Plus, Trash, Edit } from 'lucide-react';

// Printer type
interface PrinterDevice {
  id: string;
  name: string;
  type: string;
  ipAddress: string;
  port: string;
  isDefault: boolean;
}

// Sample printers
const samplePrinters: PrinterDevice[] = [
  {
    id: 'printer-1',
    name: 'Receipt Printer',
    type: 'thermal',
    ipAddress: '192.168.1.100',
    port: '9100',
    isDefault: true,
  },
  {
    id: 'printer-2',
    name: 'Label Printer',
    type: 'label',
    ipAddress: '192.168.1.101',
    port: '9100',
    isDefault: false,
  },
];

// Load printers from localStorage or use sample data
const loadPrinters = (): PrinterDevice[] => {
  try {
    const storedPrinters = localStorage.getItem('printers');
    return storedPrinters ? JSON.parse(storedPrinters) : samplePrinters;
  } catch (error) {
    console.error('Error loading printers:', error);
    return samplePrinters;
  }
};

// Save printers to localStorage
const savePrinters = (printers: PrinterDevice[]): void => {
  try {
    localStorage.setItem('printers', JSON.stringify(printers));
  } catch (error) {
    console.error('Error saving printers:', error);
  }
};

// Form schema
const printerFormSchema = z.object({
  name: z.string().min(1, { message: 'Printer name is required' }),
  type: z.string().min(1, { message: 'Printer type is required' }),
  ipAddress: z.string().min(1, { message: 'IP address is required' }),
  port: z.string().min(1, { message: 'Port is required' }),
  isDefault: z.boolean().default(false),
});

type PrinterFormValues = z.infer<typeof printerFormSchema>;

const PrinterConfiguration: React.FC = () => {
  const [printers, setPrinters] = useState<PrinterDevice[]>(loadPrinters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterDevice | null>(null);
  const [deletePrinterId, setDeletePrinterId] = useState<string | null>(null);
  
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      name: '',
      type: 'thermal',
      ipAddress: '',
      port: '9100',
      isDefault: false,
    },
  });
  
  // Handle form submission
  const onSubmit = (values: PrinterFormValues) => {
    if (editingPrinter) {
      // If setting a new printer as default, update all others
      let updatedPrinters = [...printers];
      if (values.isDefault) {
        updatedPrinters = updatedPrinters.map(printer => ({
          ...printer,
          isDefault: printer.id === editingPrinter.id ? true : false,
        }));
      } else {
        // If this was the default and is being unset, ensure there's still a default
        const wasDefault = editingPrinter.isDefault;
        updatedPrinters = updatedPrinters.map(printer => {
          if (printer.id === editingPrinter.id) {
            return { ...printer, ...values };
          }
          // If this was the only default and is being unset, make the first other printer default
          if (wasDefault && !values.isDefault && !printer.isDefault && printer.id !== editingPrinter.id) {
            return { ...printer, isDefault: true };
          }
          return printer;
        });
      }
      
      setPrinters(updatedPrinters);
      savePrinters(updatedPrinters);
      toast.success(`Printer "${values.name}" updated successfully`);
    } else {
      // Adding a new printer
      const newPrinter: PrinterDevice = {
        id: `printer-${Date.now()}`,
        name: values.name,
        type: values.type,
        ipAddress: values.ipAddress,
        port: values.port,
        isDefault: values.isDefault,
      };
      
      let updatedPrinters = [...printers, newPrinter];
      
      // If this is the first printer or set as default, update all others
      if (values.isDefault || printers.length === 0) {
        updatedPrinters = updatedPrinters.map(printer => ({
          ...printer,
          isDefault: printer.id === newPrinter.id ? true : false,
        }));
      }
      
      setPrinters(updatedPrinters);
      savePrinters(updatedPrinters);
      toast.success(`Printer "${values.name}" added successfully`);
    }
    
    handleCloseDialog();
  };
  
  // Edit printer
  const handleEditPrinter = (printer: PrinterDevice) => {
    setEditingPrinter(printer);
    form.reset({
      name: printer.name,
      type: printer.type,
      ipAddress: printer.ipAddress,
      port: printer.port,
      isDefault: printer.isDefault,
    });
    setIsDialogOpen(true);
  };
  
  // Delete printer
  const handleDeletePrinter = (printerId: string) => {
    const printerToDelete = printers.find(p => p.id === printerId);
    const isDefault = printerToDelete?.isDefault;
    
    let updatedPrinters = printers.filter(p => p.id !== printerId);
    
    // If the deleted printer was the default, set another one as default
    if (isDefault && updatedPrinters.length > 0) {
      updatedPrinters = [
        { ...updatedPrinters[0], isDefault: true },
        ...updatedPrinters.slice(1),
      ];
    }
    
    setPrinters(updatedPrinters);
    savePrinters(updatedPrinters);
    setDeletePrinterId(null);
    toast.success('Printer deleted successfully');
  };
  
  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrinter(null);
    form.reset();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Printer Configuration</CardTitle>
              <CardDescription>Manage receipt and label printers for your POS system</CardDescription>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Printer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {printers.length === 0 ? (
            <div className="text-center py-6">
              <Printer className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No printers configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printers.map((printer) => (
                <Card key={printer.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{printer.name}</h3>
                        <p className="text-sm text-muted-foreground">{printer.type} printer</p>
                        <p className="text-sm text-muted-foreground">
                          {printer.ipAddress}:{printer.port}
                        </p>
                        {printer.isDefault && (
                          <div className="mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPrinter(printer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeletePrinterId(printer.id)}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Printer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? 'Edit Printer' : 'Add New Printer'}
            </DialogTitle>
            <DialogDescription>
              Configure your printer settings for receipt and label printing
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-220px)] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Printer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter printer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Printer Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select printer type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="thermal">Thermal Printer</SelectItem>
                          <SelectItem value="label">Label Printer</SelectItem>
                          <SelectItem value="inkjet">Inkjet Printer</SelectItem>
                          <SelectItem value="laser">Laser Printer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input placeholder="9100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Default Printer</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Set as the default printer for all operations
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              {editingPrinter ? 'Update Printer' : 'Add Printer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePrinterId} onOpenChange={(open) => !open && setDeletePrinterId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Printer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this printer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePrinterId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletePrinterId && handleDeletePrinter(deletePrinterId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrinterConfiguration;
