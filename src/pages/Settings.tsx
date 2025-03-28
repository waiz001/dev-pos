
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
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="printer">Printer</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
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
            <ShopManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
