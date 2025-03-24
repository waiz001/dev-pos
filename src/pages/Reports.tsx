
import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Search, Download, FileText, Calendar, BarChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { 
  reports, 
  addReport, 
  updateReport, 
  deleteReport, 
  Report 
} from "@/utils/data";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

const Reports = () => {
  const [reportsList, setReportsList] = useState<Report[]>(reports);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const addForm = useForm<Omit<Report, "id">>({
    defaultValues: {
      name: "",
      type: "sales",
      description: "",
      createdAt: new Date(),
      format: "pdf",
      scheduled: false
    }
  });
  
  const editForm = useForm<Report>({
    defaultValues: selectedReport || {
      id: "",
      name: "",
      type: "sales",
      description: "",
      createdAt: new Date(),
      format: "pdf",
      scheduled: false
    }
  });
  
  // Update edit form when selected report changes
  React.useEffect(() => {
    if (selectedReport) {
      editForm.reset(selectedReport);
    }
  }, [selectedReport, editForm]);
  
  const handleSearch = () => {
    if (!searchQuery) {
      setReportsList(reports);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = reports.filter(report => 
      report.name.toLowerCase().includes(query) || 
      report.type.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query)
    );
    
    setReportsList(filtered);
  };
  
  // Search reports when query changes
  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, reports]);
  
  const handleAddReport = (data: Omit<Report, "id">) => {
    try {
      const newReport = addReport(data);
      setReportsList([...reports]);
      toast.success(`Report "${newReport.name}" added successfully`);
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      toast.error("Failed to add report");
      console.error(error);
    }
  };
  
  const handleEditReport = (data: Report) => {
    if (!selectedReport) return;
    
    try {
      const updated = updateReport(selectedReport.id, data);
      if (updated) {
        setReportsList([...reports]);
        toast.success(`Report "${updated.name}" updated successfully`);
        setIsEditDialogOpen(false);
        setSelectedReport(null);
      } else {
        toast.error("Report not found");
      }
    } catch (error) {
      toast.error("Failed to update report");
      console.error(error);
    }
  };
  
  const handleDeleteReport = () => {
    if (!selectedReport) return;
    
    try {
      const deleted = deleteReport(selectedReport.id);
      if (deleted) {
        setReportsList([...reports]);
        toast.success(`Report deleted successfully`);
      } else {
        toast.error("Report not found");
      }
    } catch (error) {
      toast.error("Failed to delete report");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };
  
  const handleRunReport = (report: Report) => {
    toast.success(`Generating ${report.name}...`);
    setTimeout(() => {
      toast.success(`${report.name} has been generated and is ready for download.`);
      
      // Update the lastRun date
      updateReport(report.id, {
        ...report,
        lastRun: new Date()
      });
      
      setReportsList([...reports]);
    }, 2000);
  };
  
  const getReportTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return <BarChart className="h-4 w-4" />;
      case 'inventory':
        return <FileText className="h-4 w-4" />;
      case 'customers':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const getFormattedReportType = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return 'Sales';
      case 'inventory':
        return 'Inventory';
      case 'customers':
        return 'Customers';
      case 'custom':
        return 'Custom';
      default:
        return type;
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Report Management</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                reportsList.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReportTypeIcon(report.type)}
                        <span>{getFormattedReportType(report.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(report.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {report.lastRun 
                        ? format(new Date(report.lastRun), 'MMM dd, yyyy')
                        : "Never"
                      }
                    </TableCell>
                    <TableCell>
                      {report.scheduled ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {report.scheduledFrequency}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Manual
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunReport(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Add Report Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={addForm.handleSubmit(handleAddReport)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Report Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter report name" 
                        {...addForm.register("name")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue="sales"
                        onValueChange={(value) => {
                          addForm.setValue("type", value as "sales" | "inventory" | "customers" | "custom");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="customers">Customers</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue="pdf"
                        onValueChange={(value) => {
                          addForm.setValue("format", value as "pdf" | "excel" | "csv");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter report description" 
                        {...addForm.register("description")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Schedule Report</FormLabel>
                      <Switch 
                        checked={addForm.watch("scheduled")} 
                        onCheckedChange={(checked) => {
                          addForm.setValue("scheduled", checked);
                        }}
                      />
                    </div>
                  </FormItem>
                </div>
                
                {addForm.watch("scheduled") && (
                  <div className="col-span-2">
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Select
                          defaultValue="daily"
                          onValueChange={(value) => {
                            addForm.setValue("scheduledFrequency", value as "daily" | "weekly" | "monthly");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Report</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Report Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Report</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={editForm.handleSubmit(handleEditReport)}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Report Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter report name" 
                        {...editForm.register("name")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={selectedReport?.type || "sales"}
                        onValueChange={(value) => {
                          editForm.setValue("type", value as "sales" | "inventory" | "customers" | "custom");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="customers">Customers</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-1">
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={selectedReport?.format || "pdf"}
                        onValueChange={(value) => {
                          editForm.setValue("format", value as "pdf" | "excel" | "csv");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter report description" 
                        {...editForm.register("description")} 
                        required 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <div className="col-span-2">
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Schedule Report</FormLabel>
                      <Switch 
                        checked={editForm.watch("scheduled")} 
                        onCheckedChange={(checked) => {
                          editForm.setValue("scheduled", checked);
                        }}
                      />
                    </div>
                  </FormItem>
                </div>
                
                {editForm.watch("scheduled") && (
                  <div className="col-span-2">
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Select
                          defaultValue={selectedReport?.scheduledFrequency || "daily"}
                          onValueChange={(value) => {
                            editForm.setValue("scheduledFrequency", value as "daily" | "weekly" | "monthly");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the report "{selectedReport?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDeleteReport}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Reports;
