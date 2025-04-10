
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createMigrationScript } from "@/utils/supabase-data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const handleMigrateData = async () => {
    setIsMigrating(true);
    
    try {
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
        <p className="text-yellow-500">
          Note: This operation might take some time depending on the amount of data.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMigrateData} 
          disabled={isMigrating || migrationComplete}
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </>
          ) : migrationComplete ? (
            "Migration Complete"
          ) : (
            "Migrate Data to Supabase"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataMigration;
