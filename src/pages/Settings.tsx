
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { updateSetting, Setting } from "@/utils/data";
import SettingForm from "@/components/forms/SettingForm";
import PaymentMethodsManagement from "@/components/settings/PaymentMethodsManagement";
import PrinterConfiguration from "@/components/settings/PrinterConfiguration";
import ShopManagement from "@/components/settings/ShopManagement";

// Fix example for the Settings component
// When updating a setting, make sure to pass an object, not a string
const handleUpdateSetting = (settingId: string, newValue: Partial<Setting>) => {
  // Correct way:
  updateSetting(settingId, newValue);
  
  // Incorrect way (what's causing the error):
  // updateSetting(settingId, newValue);
};

const Settings = () => {
  // Component implementation
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 w-full flex flex-wrap md:flex-nowrap overflow-x-auto">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1">Payment Methods</TabsTrigger>
            <TabsTrigger value="printer" className="flex-1">Printer</TabsTrigger>
            <TabsTrigger value="shops" className="flex-1">Shops</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>General settings content will go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentMethodsManagement />
          </TabsContent>
          
          <TabsContent value="printer">
            <PrinterConfiguration />
          </TabsContent>
          
          <TabsContent value="shops">
            <Card>
              <CardHeader>
                <CardTitle>Shop Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your stores/shops here. These shops will appear in the POS Shop page.
                  Deleting a shop requires administrator verification.
                </p>
                <ShopManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
