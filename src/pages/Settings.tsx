
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateSetting, Setting, addSetting, stores } from "@/utils/data";
import SettingForm from "@/components/forms/SettingForm";
import PaymentMethodsManagement from "@/components/settings/PaymentMethodsManagement";
import PrinterConfiguration from "@/components/settings/PrinterConfiguration";
import ShopManagement from "@/components/settings/ShopManagement";
import CompanySettings from "@/components/settings/CompanySettings";
import TaxSettings from "@/components/settings/TaxSettings";

const Settings = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="mb-4 w-full flex flex-nowrap md:flex-nowrap overflow-x-auto">
              <TabsTrigger value="general" className="flex-1 whitespace-nowrap">General</TabsTrigger>
              <TabsTrigger value="company" className="flex-1 whitespace-nowrap">Company</TabsTrigger>
              <TabsTrigger value="tax" className="flex-1 whitespace-nowrap">Tax</TabsTrigger>
              <TabsTrigger value="payments" className="flex-1 whitespace-nowrap">Payment Methods</TabsTrigger>
              <TabsTrigger value="printer" className="flex-1 whitespace-nowrap">Printer</TabsTrigger>
              <TabsTrigger value="shops" className="flex-1 whitespace-nowrap">Shops</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-[calc(100vh-220px)]">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure general application settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanySettings />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>These details will appear on receipts and invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanySettings />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tax">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                  <CardDescription>Configure tax rates for your stores</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaxSettings />
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
          </ScrollArea>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
