
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { orders, Order, Customer } from "@/utils/data";
import { format } from "date-fns";
import { CreditCard, DollarSign } from "lucide-react";

interface CustomerBalanceProps {
  customer: Customer;
  onSuccess?: () => void;
}

const CustomerBalance: React.FC<CustomerBalanceProps> = ({ customer, onSuccess }) => {
  // Get all orders for this customer that are pending
  const pendingOrders = orders.filter(
    (order) => order.customerId === customer.id && order.status === "pending"
  );

  const totalPendingAmount = pendingOrders.reduce(
    (total, order) => total + order.total,
    0
  );

  // Current balance calculation
  const currentBalance = customer.totalSpent || 0;

  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Customer Account</h3>
          <p className="text-sm text-muted-foreground">Current balance and pending payments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-base p-2 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Current Balance: ${currentBalance.toFixed(2)}
          </Badge>
          <Badge variant="outline" className="text-base p-2 flex items-center">
            <CreditCard className="h-4 w-4 mr-1" />
            Pending: ${totalPendingAmount.toFixed(2)}
          </Badge>
        </div>
      </div>

      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Payment History</h4>
        <div className="flex justify-between">
          <span>Total Credit Balance:</span>
          <span className="font-bold">${currentBalance.toFixed(2)}</span>
        </div>
      </div>

      <h4 className="text-lg font-semibold mb-4">Pending Payments</h4>

      <ScrollArea className="max-h-[60vh]">
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-muted-foreground">No pending payments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <PendingOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </ScrollArea>
      
      {onSuccess && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onSuccess}>Close</Button>
        </div>
      )}
    </div>
  );
};

interface PendingOrderCardProps {
  order: Order;
}

const PendingOrderCard: React.FC<PendingOrderCardProps> = ({ order }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Order #{order.id.slice(-5)}</CardTitle>
          <Badge>{order.status}</Badge>
        </div>
        <CardDescription>
          {format(new Date(order.date), "PPP")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Items:</p>
            <ul className="ml-4 list-disc">
              {order.items.map((item) => (
                <li key={item.id} className="text-sm">
                  {item.name} x {item.quantity} (${(item.price * item.quantity).toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">${order.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full">Pay Now</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerBalance;
