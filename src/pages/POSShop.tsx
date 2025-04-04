
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  ShoppingCart, 
  MapPin, 
  Phone, 
  Clock, 
  Users 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Load shops from localStorage or use defaults from utils/data
const loadShops = () => {
  try {
    const storedShops = localStorage.getItem('shops');
    if (storedShops) {
      return JSON.parse(storedShops);
    }
    
    // If no shops in localStorage, get the default shops from utils/data
    const { stores } = require('@/utils/data');
    return stores;
  } catch (error) {
    console.error('Error loading shops:', error);
    return [];
  }
};

const POSShop = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);

  useEffect(() => {
    setShops(loadShops());
    
    // Set up an event listener to refresh shops when they change
    const handleShopsUpdated = () => {
      setShops(loadShops());
      toast.info("Shop list has been updated");
    };
    
    window.addEventListener('shops-updated', handleShopsUpdated);
    
    return () => {
      window.removeEventListener('shops-updated', handleShopsUpdated);
    };
  }, []);

  const handleStartPOS = (storeId: string) => {
    navigate(`/pos-session?storeId=${storeId}`);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">POS Shop</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          </div>
        </div>

        {shops.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground mb-4">No shops available. Please add shops in Settings &gt; Shops.</p>
              <Button onClick={() => navigate("/settings")}>Go to Settings</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((store) => (
              <Card key={store.id} className="overflow-hidden flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={store.image} 
                    alt={store.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>{store.name}</CardTitle>
                  </div>
                  <CardDescription>Manage POS for this location</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{store.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{store.employees} employees</span>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartPOS(store.id)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Start POS Session
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default POSShop;
