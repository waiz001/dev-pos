
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { addSetting, updateSetting, settings, stores } from "@/utils/data";
import { Plus, Save, X } from "lucide-react";

const TaxSettings = () => {
  const [globalTaxRate, setGlobalTaxRate] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeTaxRate, setStoreTaxRate] = useState("");
  const [storeTaxes, setStoreTaxes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing tax settings
    const taxSetting = settings.find(s => s.name === "Tax Rate");
    if (taxSetting) {
      setGlobalTaxRate(taxSetting.value);
    }

    // Load store-specific tax rates
    const storeSpecificTaxes = settings.filter(
      s => s.name.startsWith("Tax Rate-") && s.category === "tax"
    );

    const storeRates = storeSpecificTaxes.map(tax => {
      const storeId = tax.name.replace("Tax Rate-", "");
      const store = stores.find(s => s.id === storeId);
      return {
        id: tax.id,
        storeId,
        storeName: store ? store.name : "Unknown Store",
        taxRate: tax.value
      };
    });

    setStoreTaxes(storeRates);
  }, []);

  const handleSaveGlobalTax = () => {
    setIsSaving(true);

    // Update or create global tax setting
    const existingTaxSetting = settings.find(s => s.name === "Tax Rate");
    if (existingTaxSetting) {
      updateSetting(existingTaxSetting.id, { value: globalTaxRate });
    } else {
      addSetting({
        name: "Tax Rate",
        value: globalTaxRate,
        category: "tax",
        description: "Default sales tax percentage"
      });
    }

    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleAddStoreTax = () => {
    if (!selectedStoreId || !storeTaxRate) return;

    const store = stores.find(s => s.id === selectedStoreId);
    if (!store) return;

    // Check if tax for this store already exists
    const existingStoreTaxIndex = storeTaxes.findIndex(
      tax => tax.storeId === selectedStoreId
    );

    if (existingStoreTaxIndex >= 0) {
      // Update existing store tax
      const existingTax = storeTaxes[existingStoreTaxIndex];
      updateSetting(existingTax.id, { value: storeTaxRate });

      // Update local state
      const updatedTaxes = [...storeTaxes];
      updatedTaxes[existingStoreTaxIndex] = {
        ...existingTax,
        taxRate: storeTaxRate
      };
      setStoreTaxes(updatedTaxes);
    } else {
      // Create new store tax
      const newTaxSetting = addSetting({
        name: `Tax Rate-${selectedStoreId}`,
        value: storeTaxRate,
        category: "tax",
        description: `Tax rate for ${store.name}`
      });

      // Update local state
      setStoreTaxes([
        ...storeTaxes,
        {
          id: newTaxSetting.id,
          storeId: selectedStoreId,
          storeName: store.name,
          taxRate: storeTaxRate
        }
      ]);
    }

    // Reset form
    setSelectedStoreId("");
    setStoreTaxRate("");
  };

  const handleRemoveStoreTax = (taxId) => {
    // Find the tax setting in our local state
    const taxToRemove = storeTaxes.find(tax => tax.id === taxId);
    if (!taxToRemove) return;

    // Find the actual setting
    const settingToRemove = settings.find(s => s.id === taxId);
    if (settingToRemove) {
      // Remove from settings
      const settingIndex = settings.findIndex(s => s.id === taxId);
      if (settingIndex >= 0) {
        settings.splice(settingIndex, 1);
      }
    }

    // Remove from local state
    setStoreTaxes(storeTaxes.filter(tax => tax.id !== taxId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Global Tax Rate</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="globalTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="globalTaxRate"
                type="number"
                min="0"
                step="0.01"
                value={globalTaxRate}
                onChange={(e) => setGlobalTaxRate(e.target.value)}
                placeholder="e.g. 10.00"
              />
            </div>
            
            <Button 
              onClick={handleSaveGlobalTax} 
              disabled={isSaving}
              className="w-full md:w-auto self-end"
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Global Tax Rate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Store-Specific Tax Rates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
            <div className="space-y-2">
              <Label htmlFor="storeSelect">Select Store</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger id="storeSelect">
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeTaxRate">Tax Rate (%)</Label>
              <Input
                id="storeTaxRate"
                type="number"
                min="0"
                step="0.01"
                value={storeTaxRate}
                onChange={(e) => setStoreTaxRate(e.target.value)}
                placeholder="e.g. 8.50"
              />
            </div>
            
            <Button 
              onClick={handleAddStoreTax} 
              disabled={!selectedStoreId || !storeTaxRate}
              className="w-full md:w-auto self-end"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Store Tax
            </Button>
          </div>
          
          {storeTaxes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Tax Rate (%)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeTaxes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell>{tax.storeName}</TableCell>
                    <TableCell>{tax.taxRate}%</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveStoreTax(tax.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No store-specific tax rates configured.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxSettings;
