
import React, { useState } from "react";
import { Edit, Save, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { 
  settings, 
  getSettingsByCategory,
  updateSetting,
  Setting 
} from "@/utils/data";
import { useForm } from "react-hook-form";
import ShopManagement from "@/components/settings/ShopManagement";
import PaymentMethodsManagement from "@/components/settings/PaymentMethodsManagement";
import PrinterConfiguration from "@/components/settings/PrinterConfiguration";

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSettings, setFilteredSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<Setting['category']>("general");
  const [editSetting, setEditSetting] = useState<string | null>(null);
  
  const form = useForm({
    defaultValues: {
      settingValue: ""
    }
  });
  
  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredSettings(settings);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = settings.filter(setting => 
      setting.name.toLowerCase().includes(query) || 
      setting.value.toLowerCase().includes(query) ||
      setting.description.toLowerCase().includes(query) ||
      setting.category.toLowerCase().includes(query)
    );
    
    setFilteredSettings(filtered);
  };
  
  // Search settings when query changes
  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, settings]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as Setting['category']);
    setEditSetting(null);
  };
  
  const handleEditSetting = (settingId: string, currentValue: string) => {
    setEditSetting(settingId);
    form.setValue("settingValue", currentValue);
  };
  
  const handleSaveSetting = (settingId: string) => {
    const newValue = form.getValues("settingValue");
    
    try {
      const updated = updateSetting(settingId, newValue);
      if (updated) {
        setFilteredSettings([...settings]);
        toast.success(`Setting updated successfully`);
      } else {
        toast.error("Setting not found");
      }
    } catch (error) {
      toast.error("Failed to update setting");
      console.error(error);
    } finally {
      setEditSetting(null);
    }
  };
  
  const categoryMap = {
    general: "General",
    payment: "Payment",
    tax: "Tax",
    printer: "Printer",
    notification: "Notifications",
    security: "Security"
  };
  
  const getSettingsForTab = (category: Setting['category']) => {
    return settings.filter(setting => setting.category === category);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search settings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 w-full max-w-md">
            {Object.entries(categoryMap).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="flex-1">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {searchQuery ? (
            // Show search results
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSettings.length > 0 ? (
                filteredSettings.map(setting => (
                  <Card key={setting.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{setting.name}</CardTitle>
                      <CardDescription>
                        {categoryMap[setting.category]} setting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <FormField
                          name="settingValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  {editSetting === setting.id ? (
                                    <Input 
                                      {...field} 
                                      defaultValue={setting.value}
                                      onChange={(e) => form.setValue("settingValue", e.target.value)}
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                  )}
                                </FormControl>
                                {editSetting === setting.id ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleSaveSetting(setting.id)}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditSetting(setting.id, setting.value)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <FormDescription>{setting.description}</FormDescription>
                            </FormItem>
                          )}
                        />
                      </Form>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No settings found matching "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            // Show settings by category
            <>
              <TabsContent value="general">
                <ShopManagement />
                
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {getSettingsForTab('general').map(setting => (
                    <Card key={setting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <FormField
                            name="settingValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    {editSetting === setting.id ? (
                                      <Input 
                                        {...field} 
                                        defaultValue={setting.value}
                                        onChange={(e) => form.setValue("settingValue", e.target.value)}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                    )}
                                  </FormControl>
                                  {editSetting === setting.id ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleSaveSetting(setting.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditSetting(setting.id, setting.value)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <FormDescription>{setting.description}</FormDescription>
                              </FormItem>
                            )}
                          />
                        </Form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="payment">
                <PaymentMethodsManagement />
                
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {getSettingsForTab('payment').map(setting => (
                    <Card key={setting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <FormField
                            name="settingValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    {editSetting === setting.id ? (
                                      <Input 
                                        {...field} 
                                        defaultValue={setting.value}
                                        onChange={(e) => form.setValue("settingValue", e.target.value)}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                    )}
                                  </FormControl>
                                  {editSetting === setting.id ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleSaveSetting(setting.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditSetting(setting.id, setting.value)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <FormDescription>{setting.description}</FormDescription>
                              </FormItem>
                            )}
                          />
                        </Form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="printer">
                <PrinterConfiguration />
                
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {getSettingsForTab('printer').map(setting => (
                    <Card key={setting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <FormField
                            name="settingValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    {editSetting === setting.id ? (
                                      <Input 
                                        {...field} 
                                        defaultValue={setting.value}
                                        onChange={(e) => form.setValue("settingValue", e.target.value)}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                    )}
                                  </FormControl>
                                  {editSetting === setting.id ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleSaveSetting(setting.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditSetting(setting.id, setting.value)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <FormDescription>{setting.description}</FormDescription>
                              </FormItem>
                            )}
                          />
                        </Form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tax">
                <div className="grid gap-4 md:grid-cols-2">
                  {getSettingsForTab('tax').map(setting => (
                    <Card key={setting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <FormField
                            name="settingValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    {editSetting === setting.id ? (
                                      <Input 
                                        {...field} 
                                        defaultValue={setting.value}
                                        onChange={(e) => form.setValue("settingValue", e.target.value)}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                    )}
                                  </FormControl>
                                  {editSetting === setting.id ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleSaveSetting(setting.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditSetting(setting.id, setting.value)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <FormDescription>{setting.description}</FormDescription>
                              </FormItem>
                            )}
                          />
                        </Form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="notification">
                <div className="grid gap-4 md:grid-cols-2">
                  {getSettingsForTab('notification').map(setting => (
                    <Card key={setting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <FormField
                            name="settingValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    {editSetting === setting.id ? (
                                      <Input 
                                        {...field} 
                                        defaultValue={setting.value}
                                        onChange={(e) => form.setValue("settingValue", e.target.value)}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                    )}
                                  </FormControl>
                                  {editSetting === setting.id ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleSaveSetting(setting.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditSetting(setting.id, setting.value)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <FormDescription>{setting.description}</FormDescription>
                              </FormItem>
                            )}
                          />
                        </Form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="grid gap-4 md:grid-cols-2">
                  {getSettingsForTab('security').map(setting => (
                    <Card key={setting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <FormField
                            name="settingValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    {editSetting === setting.id ? (
                                      <Input 
                                        {...field} 
                                        defaultValue={setting.value}
                                        onChange={(e) => form.setValue("settingValue", e.target.value)}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="rounded-md border border-input bg-background p-2">{setting.value}</div>
                                    )}
                                  </FormControl>
                                  {editSetting === setting.id ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleSaveSetting(setting.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditSetting(setting.id, setting.value)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <FormDescription>{setting.description}</FormDescription>
                              </FormItem>
                            )}
                          />
                        </Form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
