
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { addSetting, updateSetting, settings } from "@/utils/data";
import { Save } from "lucide-react";

const CompanySettings = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing settings
    const storeName = settings.find(s => s.name === "Store Name");
    const storeLogo = settings.find(s => s.name === "Store Logo");
    const storeAddress = settings.find(s => s.name === "Store Address");
    const storePhone = settings.find(s => s.name === "Store Phone");

    if (storeName) setCompanyName(storeName.value);
    if (storeLogo) setCompanyLogo(storeLogo.value);
    if (storeAddress) setCompanyAddress(storeAddress.value);
    if (storePhone) setCompanyPhone(storePhone.value);
  }, []);

  const handleSave = () => {
    setIsSaving(true);

    // Update or create company settings
    const saveOrUpdate = (name, value, description) => {
      const existingSetting = settings.find(s => s.name === name);
      if (existingSetting) {
        updateSetting(existingSetting.id, { value });
      } else {
        addSetting({
          name,
          value,
          category: "general",
          description
        });
      }
    };

    saveOrUpdate(
      "Store Name", 
      companyName, 
      "Company name shown on receipts and invoices"
    );
    
    saveOrUpdate(
      "Store Logo", 
      companyLogo, 
      "URL to company logo for receipts and invoices"
    );
    
    saveOrUpdate(
      "Store Address", 
      companyAddress, 
      "Company address shown on receipts and invoices"
    );
    
    saveOrUpdate(
      "Store Phone", 
      companyPhone, 
      "Company phone shown on receipts and invoices"
    );

    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyLogo">Company Logo URL</Label>
          <Input
            id="companyLogo"
            value={companyLogo}
            onChange={(e) => setCompanyLogo(e.target.value)}
            placeholder="Enter URL to your company logo"
          />
          {companyLogo && (
            <div className="mt-2 p-2 border rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="max-h-20 max-w-full object-contain" 
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                  e.currentTarget.classList.add("border", "border-red-500");
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyAddress">Company Address</Label>
          <Input
            id="companyAddress"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="Enter your company address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyPhone">Company Phone</Label>
          <Input
            id="companyPhone"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="Enter your company phone number"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
        {isSaving ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Company Information
          </>
        )}
      </Button>
    </div>
  );
};

export default CompanySettings;
