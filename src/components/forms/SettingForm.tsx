
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Setting } from "@/utils/data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const settingSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  value: z.string(),
  category: z.enum(["general", "payment", "tax", "printer", "notification", "security"], {
    required_error: "Please select a category.",
  }),
  description: z.string(),
});

type SettingFormValues = z.infer<typeof settingSchema>;

interface SettingFormProps {
  onSubmit: (data: SettingFormValues) => void;
  initialData?: Partial<Setting>;
  buttonText?: string;
}

const SettingForm: React.FC<SettingFormProps> = ({
  onSubmit,
  initialData = {},
  buttonText = "Save Setting",
}) => {
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      name: initialData.name || "",
      value: initialData.value || "",
      category: initialData.category || "general",
      description: initialData.description || "",
    },
  });

  const watchCategory = form.watch("category");

  const handleSubmit = (values: SettingFormValues) => {
    onSubmit(values);
    toast.success(`Setting ${initialData.id ? "updated" : "created"} successfully`);
  };

  const renderValueField = () => {
    if (watchCategory === "notification" || watchCategory === "security") {
      return (
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value === "true" ? "true" : "false"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    } else if (watchCategory === "tax") {
      return (
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Tax percentage"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    } else {
      return (
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input placeholder="Setting value" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full max-w-xl mx-auto">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setting Name</FormLabel>
              <FormControl>
                <Input placeholder="Store Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderValueField()}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Description of what this setting controls"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto">{buttonText}</Button>
      </form>
    </Form>
  );
};

export default SettingForm;
