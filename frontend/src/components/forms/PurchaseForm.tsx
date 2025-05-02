import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Vendor {
  id: number;
  name: string;
  contact?: string;
  address?: string;
  gstNo?: string;
}

export interface PurchaseOrder {
  id: number;
  vendorId: number;
  materialId: number;
  qty: number;
  rate: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  Vendor?: Vendor;
  Material?: Material;
}

// Define the form schema
const formSchema = z.object({
  vendorId: z.coerce.number().positive("Please select a vendor"),
  materialId: z.coerce.number().positive("Please select a material"),
  qty: z.coerce.number().positive("Quantity must be positive"),
  rate: z.coerce.number().positive("Rate must be positive"),
  status: z.enum(["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"]),
  orderDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  address: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export type PurchaseFormValues = z.infer<typeof formSchema>;

interface PurchaseFormProps {
  editRow: PurchaseOrder | null;
  vendors: Vendor[];
  materials: Material[];
  onCancel: () => void;
  onSubmit: (values: PurchaseFormValues) => Promise<void>;
}

export const PurchaseForm = React.memo(
  ({ editRow, vendors, materials, onCancel, onSubmit }: PurchaseFormProps) => {
    // Initialize form
    const form = useForm<PurchaseFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        vendorId: 0,
        materialId: 0,
        qty: 0,
        rate: 0,
        status: "PENDING",
        orderDate: format(new Date(), "yyyy-MM-dd"),
        address: "",
      },
    });

    // Reset form when editing row changes
    useEffect(() => {
      if (editRow) {
        form.reset({
          vendorId: editRow.vendorId,
          materialId: editRow.materialId,
          qty: editRow.qty,
          rate: editRow.rate,
          status: editRow.status,
          orderDate: editRow.orderDate
            ? format(new Date(editRow.orderDate), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
          address: editRow.Vendor?.address || "",
        });
      } else {
        form.reset({
          vendorId: 0,
          materialId: 0,
          qty: 0,
          rate: 0,
          status: "PENDING",
          orderDate: format(new Date(), "yyyy-MM-dd"),
          address: "",
        });
      }
    }, [editRow, form]);

    const handleFormSubmit = form.handleSubmit(onSubmit);

    return (
      <div className="w-full">
        <div className="mb-4 flex flex-col items-start">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mb-2 text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1 text-gray-800" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {editRow ? "Edit Purchase Order" : "Add New Purchase Order"}
          </h1>
        </div>

        <Card className="p-10 bg-white border border-gray-200">
          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor field */}
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Vendor *
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-600"
                          {...field}
                        >
                          <option value={0}>Select Vendor</option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Order Date field */}
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Order Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="w-full bg-white text-gray-800 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status field */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Status *
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-600"
                          {...field}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address field */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Delivery Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          placeholder="Enter delivery address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h2 className="text-base font-semibold mb-2">Item Details</h2>
                <Card className="p-4 bg-white border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="w-1/3 text-gray-700 font-semibold">
                          Material
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Quantity
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Rate
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name="materialId"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <select
                                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600"
                                    {...field}
                                  >
                                    <option value={0}>Select Material</option>
                                    {materials.map((material) => (
                                      <option
                                        key={material.id}
                                        value={material.id}
                                      >
                                        {material.name} ({material.uom})
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name="qty"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="w-full bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name="rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="w-full bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-gray-800">
                          <span className="font-medium">
                            ₹
                            {(form.watch("qty") * form.watch("rate")).toFixed(
                              2
                            ) || "0.00"}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="text-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {form.formState.isSubmitting
                    ? "Saving..."
                    : editRow
                    ? "Update Purchase Order"
                    : "Save Purchase Order"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    );
  }
);

PurchaseForm.displayName = "PurchaseForm";

export default PurchaseForm;
