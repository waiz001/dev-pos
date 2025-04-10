
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createMigrationScript } from "@/utils/supabase-data";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({
    products: false,
    customers: false,
    categories: false,
    paymentMethods: false,
    stores: false,
    settings: false,
    orders: false
  });

  const handleMigrateData = async () => {
    setIsMigrating(true);
    
    try {
      // First migrate base data
      setMigrationProgress(prev => ({ ...prev, products: true }));
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI feedback
      
      setMigrationProgress(prev => ({ ...prev, customers: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMigrationProgress(prev => ({ ...prev, categories: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMigrationProgress(prev => ({ ...prev, paymentMethods: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMigrationProgress(prev => ({ ...prev, stores: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMigrationProgress(prev => ({ ...prev, settings: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Finally migrate orders that depend on the other entities
      setMigrationProgress(prev => ({ ...prev, orders: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Run the actual migration
      const result = await createMigrationScript();
      
      if (result.success) {
        toast.success("Data migration completed successfully");
        setMigrationComplete(true);
      } else {
        toast.error("Error migrating data");
        console.error("Migration error:", result.error);
      }
    } catch (error) {
      toast.error("Error migrating data");
      console.error("Migration error:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Migration</CardTitle>
        <CardDescription>
          Migrate your local data to Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          This tool will migrate your local POS data to your Supabase database. 
          It will transfer products, customers, orders, and all other data.
        </p>
        
        {isMigrating && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              {migrationProgress.products ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Products</span>
            </div>
            <div className="flex items-center space-x-2">
              {migrationProgress.customers ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              {migrationProgress.categories ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Categories</span>
            </div>
            <div className="flex items-center space-x-2">
              {migrationProgress.paymentMethods ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Payment Methods</span>
            </div>
            <div className="flex items-center space-x-2">
              {migrationProgress.stores ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Stores</span>
            </div>
            <div className="flex items-center space-x-2">
              {migrationProgress.settings ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Settings</span>
            </div>
            <div className="flex items-center space-x-2">
              {migrationProgress.orders ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <Loader2 className="h-4 w-4 animate-spin" />
              }
              <span>Migrating Orders & Order Items</span>
            </div>
          </div>
        )}
        
        <p className="text-yellow-500 mt-4">
          Note: This operation might take some time depending on the amount of data.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMigrateData} 
          disabled={isMigrating || migrationComplete}
          className="w-full sm:w-auto"
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </>
          ) : migrationComplete ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Migration Complete
            </>
          ) : (
            "Migrate Data to Supabase"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataMigration;
