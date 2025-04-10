
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataMigration from "./DataMigration";
import { TABLES } from "@/utils/supabase";

const DatabaseSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Settings</CardTitle>
          <CardDescription>
            Manage Supabase database connection and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Connection Status</h3>
              <p className="text-green-600 font-medium">✓ Connected to Supabase</p>
              <p className="text-muted-foreground mt-2">
                Your data is now stored in a secure, cloud-based database that can be accessed from anywhere.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Available Tables</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {Object.values(TABLES).map((table) => (
                  <div key={table} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                    {table}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataMigration />
    </div>
  );
};

export default DatabaseSettings;
