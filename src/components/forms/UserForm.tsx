
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const userSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.enum(["admin", "cashier", "manager"]),
  permissions: z.object({
    products: z.boolean().default(false),
    orders: z.boolean().default(false),
    customers: z.boolean().default(false),
    reports: z.boolean().default(false),
    settings: z.boolean().default(false),
    users: z.boolean().default(false),
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  onSubmit: (data: UserFormValues) => void;
  initialData?: Partial<User>;
  buttonText?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  initialData = {
    permissions: {
      products: false,
      orders: false,
      customers: false,
      reports: false,
      settings: false,
      users: false,
    }
  },
  buttonText = "Save User",
}) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: initialData.username || "",
      name: initialData.name || "",
      role: initialData.role || "cashier",
      permissions: {
        products: initialData.permissions?.products || false,
        orders: initialData.permissions?.orders || false,
        customers: initialData.permissions?.customers || false,
        reports: initialData.permissions?.reports || false,
        settings: initialData.permissions?.settings || false,
        users: initialData.permissions?.users || false,
      },
    },
  });

  const role = form.watch("role");

  // Update permissions based on role selection
  React.useEffect(() => {
    if (role === "admin") {
      form.setValue("permissions", {
        products: true,
        orders: true,
        customers: true,
        reports: true,
        settings: true,
        users: true,
      });
    } else if (role === "manager") {
      form.setValue("permissions", {
        products: true,
        orders: true,
        customers: true,
        reports: true,
        settings: false,
        users: false,
      });
    } else if (role === "cashier") {
      form.setValue("permissions", {
        products: true,
        orders: true,
        customers: true,
        reports: false,
        settings: false,
        users: false,
      });
    }
  }, [role, form]);

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6">
          <h3 className="text-lg font-medium">Permissions</h3>
          <div className="mt-3 space-y-3">
            <FormField
              control={form.control}
              name="permissions.products"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={role === "admin"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Products</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions.orders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={role === "admin"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Orders</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions.customers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={role === "admin"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Customers</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions.reports"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={role === "admin"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Reports</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions.settings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={role === "admin"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Settings</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions.users"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={role === "admin"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Users Management</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">{buttonText}</Button>
      </form>
    </Form>
  );
};

export default UserForm;
