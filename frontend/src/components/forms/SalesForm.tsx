"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Customer {
  id: number;
  name: string;
  address?: string;
  gstNo?: string;
  contact?: string;
}

// Define the form schema
const formSchema = z.object({
  customerId: z.coerce.number().positive("Please select a customer"),
  materialId: z.coerce.number().positive("Please select a material"),
  qty: z.coerce.number().positive("Quantity must be positive"),
  rate: z.coerce.number().positive("Rate must be positive"),
  vehicleNo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  orderDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  // Address is optional but shouldn't be included in the API request
  address: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type FormValues = z.infer<typeof formSchema>;

interface SalesFormProps {
  customers: Customer[];
  materials: Material[];
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}

function SalesForm({
  customers,
  materials,
  onSubmit,
  onCancel,
}: SalesFormProps) {
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 0,
      materialId: 0,
      qty: 0,
      rate: 0,
      vehicleNo: "",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      address: "",
    },
  });

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
          Add New Sales Order
        </h1>
      </div>

      <Card className="bg-white shadow-md rounded-md p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer field */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Customer Name *
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-md text-gray-600"
                        {...field}
                      >
                        <option value={0}>Select Customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
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

              {/* Vehicle Number field */}
              <FormField
                control={form.control}
                name="vehicleNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Vehicle Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter vehicle number"
                        {...field}
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      />
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
                        placeholder="Enter delivery address"
                        {...field}
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold mb-2">Item Details</h2>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-gray-800">
                        <FormField
                          control={form.control}
                          name="materialId"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <select
                                  className="w-full p-2 border border-gray-200 rounded-md text-gray-600"
                                  {...field}
                                >
                                  <option value={0}>Select Material</option>
                                  {materials.map((material) => (
                                    <option
                                      key={material.id}
                                      value={material.id}
                                    >
                                      {material.name}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {form.watch("materialId")
                          ? materials.find(
                              (m) => m.id === Number(form.watch("materialId"))
                            )?.uom || ""
                          : ""}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        <FormField
                          control={form.control}
                          name="qty"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
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
                        <FormField
                          control={form.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
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
                      <TableCell className="text-gray-800 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(form.watch("qty") * form.watch("rate") || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="text-gray-800"
              >
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Order"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default React.memo(SalesForm);
