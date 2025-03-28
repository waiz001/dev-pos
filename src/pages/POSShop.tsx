
import React from "react";
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

// Mock store data - in a real app, this would come from your backend
const stores = [
  {
    id: "store-1",
    name: "Main Store",
    address: "123 Main Street, Anytown",
    phone: "+1 (555) 123-4567",
    hours: "9:00 AM - 9:00 PM",
    employees: 5,
    image: "https://images.unsplash.com/photo-1582539511848-55707aee0625?auto=format&fit=crop&q=80&w=500&h=300"
  },
  {
    id: "store-2",
    name: "Downtown Branch",
    address: "456 Commerce Ave, Downtown",
    phone: "+1 (555) 987-6543",
    hours: "8:00 AM - 8:00 PM",
    employees: 3,
    image: "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&q=80&w=500&h=300"
  },
  {
    id: "store-3",
    name: "Shopping Mall Kiosk",
    address: "789 Mall Plaza, Shop #42",
    phone: "+1 (555) 456-7890",
    hours: "10:00 AM - 10:00 PM",
    employees: 2,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=500&h=300"
  }
];

const POSShop = () => {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
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
      </div>
    </MainLayout>
  );
};

export default POSShop;
