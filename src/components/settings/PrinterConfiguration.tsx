import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash, Printer, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Printer data type
interface Printer {
  id: string;
  name: string;
  ipAddress: string;
  port: string;
  type: 'thermal' | 'laser' | 'inkjet' | 'other';
  isDefault: boolean;
  isActive: boolean;
}

// Load printers from localStorage
const loadPrinters = (): Printer[] => {
  try {
    const storedPrinters = localStorage.getItem('printers');
    return storedPrinters ? JSON.parse(storedPrinters) : [];
  } catch (error) {
    console.error('Error loading printers:', error);
    return [];
  }
};

// Save printers to localStorage
const savePrinters = (printers: Printer[]): void => {
  try {
    localStorage.setItem('printers', JSON.stringify(printers));
  } catch (error) {
    console.error('Error saving printers:', error);
  }
};

// Form schema
const printerFormSchema = z.object({
  name: z.string().min(1, { message: 'Printer name is required' }),
  ipAddress: z.string().min(1, { message: 'IP address is required' }),
  port: z.string().min(1, { message: 'Port is required' }),
  type: z.enum(['thermal', 'laser', 'inkjet', 'other'], {
    required_error: 'Please select a printer type',
  }),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

type PrinterFormValues = z.infer<typeof printerFormSchema>;

interface PrinterConfigurationProps {
  // Any props needed
}

const PrinterConfiguration: React.FC<PrinterConfigurationProps> = () => {
  const [printers, setPrinters] = useState<Printer[]>(loadPrinters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deletePrinterId, setDeletePrinterId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      name: '',
      ipAddress: '',
      port: '9100', // Default port for most printers
      type: 'thermal',
      isDefault: false,
      isActive: true
    }
  });
  
  // Edit printer
  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter(printer);
    form.reset({
      name: printer.name,
      ipAddress: printer.ipAddress,
      port: printer.port,
      type: printer.type,
      isDefault: printer.isDefault,
      isActive: printer.isActive
    });
    setIsDialogOpen(true);
  };
  
  // Delete printer
  const handleDeletePrinter = (printerId: string) => {
    const updatedPrinters = printers.filter(printer => printer.id !== printerId);
    setPrinters(updatedPrinters);
    savePrinters(updatedPrinters);
    setDeletePrinterId(null);
    toast.success('Printer deleted successfully');
  };
  
  // Test printer connection
  const testPrinterConnection = (printer: Printer) => {
    setIsTesting(true);
    
    // In a real app, you would actually try to connect to the printer
    // For this demo, we'll just simulate a connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast.success(`Successfully connected to ${printer.name}`);
      } else {
        toast.error(`Failed to connect to ${printer.name}. Please check the IP address and port.`);
      }
      
      setIsTesting(false);
    }, 2000);
  };
  
  // Set printer as default
  const setAsDefault = (printerId: string) => {
    const updatedPrinters = printers.map(printer => ({
      ...printer,
      isDefault: printer.id === printerId
    }));
    
    setPrinters(updatedPrinters);
    savePrinters(updatedPrinters);
    toast.success('Default printer updated');
  };
  
  // Toggle printer active status
  const togglePrinterActive = (printerId: string) => {
    const updatedPrinters = printers.map(printer => 
      printer.id === printerId ? { ...printer, isActive: !printer.isActive } : printer
    );
    setPrinters(updatedPrinters);
    savePrinters(updatedPrinters);
  };
  
  // Add or update printer
  const onSubmit = (values: PrinterFormValues) => {
    // If setting as default, update all other printers
    if (values.isDefault) {
      printers.forEach(printer => {
        if (printer.id !== (editingPrinter?.id || '')) {
          printer.isDefault = false;
        }
      });
    }
    
    if (editingPrinter) {
      // Update existing printer
      const updatedPrinters = printers.map(printer => 
        printer.id === editingPrinter.id ? { ...printer, ...values } : printer
      );
      setPrinters(updatedPrinters);
      savePrinters(updatedPrinters);
      toast.success('Printer updated successfully');
    } else {
      // Add new printer
      const newPrinter: Printer = {
        id: `printer-${Date.now()}`,
        name: values.name,
        ipAddress: values.ipAddress,
        port: values.port,
        type: values.type,
        isDefault: printers.length === 0 ? true : values.isDefault,
        isActive: values.isActive
      };
      
      const updatedPrinters = [...printers, newPrinter];
      setPrinters(updatedPrinters);
      savePrinters(updatedPrinters);
      toast.success('Printer added successfully');
    }
    
    handleCloseDialog();
  };
  
  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrinter(null);
    form.reset();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Printer Configuration</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Printer
        </Button>
      </div>
      
      {printers.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No printers configured. Add a printer to enable direct printing functionality.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {printers.map(printer => (
            <Card key={printer.id} className={!printer.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {printer.name} 
                    {printer.isDefault && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </CardTitle>
                  <Switch 
                    checked={printer.isActive} 
                    onCheckedChange={() => togglePrinterActive(printer.id)}
                  />
                </div>
                <CardDescription>IP: {printer.ipAddress}:{printer.port}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p><strong>Type:</strong> {printer.type.charAt(0).toUpperCase() + printer.type.slice(1)}</p>
                  <p className="text-muted-foreground mt-1">
                    {printer.isActive 
                      ? "This printer is active and available for use" 
                      : "This printer is currently inactive"}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => testPrinterConnection(printer)}
                  disabled={isTesting || !printer.isActive}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Test Connection
                </Button>
                <div className="flex gap-2">
                  {!printer.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAsDefault(printer.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditPrinter(printer)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDeletePrinterId(printer.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Printer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrinter ? 'Edit Printer' : 'Add New Printer'}</DialogTitle>
            <DialogDescription>
              {editingPrinter 
                ? 'Update the printer information below' 
                : 'Configure a new printer for your POS system'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Printer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Main Reception Printer" {...field} />
                    </FormControl>
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
                      <Input placeholder="e.g. 192.168.1.100" {...field} />
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
                      <Input placeholder="e.g. 9100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Standard printer port is usually 9100
                    </FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select printer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="thermal">Thermal</SelectItem>
                        <SelectItem value="laser">Laser</SelectItem>
                        <SelectItem value="inkjet">Inkjet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <FormDescription>
                        Make this the default printer for all operations
                      </FormDescription>
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
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Enable this printer for use in the system
                      </FormDescription>
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPrinter ? 'Update Printer' : 'Add Printer'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePrinterId} onOpenChange={(open) => !open && setDeletePrinterId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
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
