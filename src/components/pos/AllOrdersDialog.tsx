
import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  orders as allOrders, 
  getOrder,
  Order
} from "@/utils/data";
import { formatDistanceToNow } from "date-fns";

interface AllOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOrder: (order: Order) => void;
}

const AllOrdersDialog: React.FC<AllOrdersDialogProps> = ({
  open,
  onOpenChange,
  onSelectOrder
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Refresh orders list when dialog opens
  useEffect(() => {
    if (open) {
      setOrders([...allOrders].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  }, [open]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-blue-500">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const order = getOrder(orderId);
    if (order) {
      onSelectOrder(order);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>All Orders</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(order.date), { addSuffix: true })}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSelectOrder(order.id)}
                        disabled={order.status === "completed" || order.status === "cancelled"}
                      >
                        {order.status === "in-progress" ? "Resume" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllOrdersDialog;
