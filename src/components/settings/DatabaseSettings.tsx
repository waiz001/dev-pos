
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataMigration from "./DataMigration";

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
          <p>Your POS is connected to Supabase.</p>
          <p className="text-muted-foreground mt-2">
            Your data is now stored in a secure, cloud-based database that can be accessed from anywhere.
          </p>
        </CardContent>
      </Card>

      <DataMigration />
    </div>
  );
};

export default DatabaseSettings;
