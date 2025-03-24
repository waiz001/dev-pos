
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
import { orders, Order, Customer } from "@/utils/data";
import { format } from "date-fns";

interface CustomerBalanceProps {
  customer: Customer;
}

const CustomerBalance: React.FC<CustomerBalanceProps> = ({ customer }) => {
  // Get all orders for this customer that are pending
  const pendingOrders = orders.filter(
    (order) => order.customerId === customer.id && order.status === "pending"
  );

  const totalPendingAmount = pendingOrders.reduce(
    (total, order) => total + order.total,
    0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Balance: ${totalPendingAmount.toFixed(2)}</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Balance for {customer.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pending Payments</h3>
            <Badge variant="outline" className="text-lg">
              Total: ${totalPendingAmount.toFixed(2)}
            </Badge>
          </div>

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
        </div>
      </DialogContent>
    </Dialog>
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
          <CardTitle>Order #{order.id.split("-")[1]}</CardTitle>
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
