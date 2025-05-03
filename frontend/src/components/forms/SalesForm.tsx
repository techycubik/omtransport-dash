"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";

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

interface CrusherSite {
  id: number;
  name: string;
  location: string;
}

// Define the form schema with items array for multiple materials
const formSchema = z.object({
  customerId: z.coerce.number().positive("Please select a customer"),
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
  challanNo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  items: z.array(z.object({
    materialId: z.coerce.number().positive("Please select a material"),
    crusherSiteId: z.coerce.number().optional(),
    qty: z.coerce.number().positive("Quantity must be positive"),
    rate: z.coerce.number().optional().default(0),
    uom: z.string().min(1, "UOM is required"),
  })).min(1, "At least one item is required"),
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
  const [crusherSites, setCrusherSites] = useState<CrusherSite[]>([]);
  
  // Fetch crusher sites
  useEffect(() => {
    const fetchCrusherSites = async () => {
      try {
        const response = await api("/api/crusher/sites");
        if (response.ok) {
          const data = await response.json();
          setCrusherSites(data);
        } else {
          console.error("Failed to fetch crusher sites");
        }
      } catch (error) {
        console.error("Error fetching crusher sites:", error);
      }
    };
    
    fetchCrusherSites();
  }, []);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 0,
      vehicleNo: "",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      address: "",
      challanNo: "",
      items: [
        {
          materialId: 0,
          crusherSiteId: undefined,
          qty: 0,
          rate: 0,
          uom: "Ton",
        }
      ],
    },
  });

  // Use field array for multiple items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Handle customer change to populate address
  const handleCustomerChange = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer && customer.address) {
      form.setValue("address", customer.address);
    } else {
      form.setValue("address", "");
    }
  };

  // Calculate total amount for all items
  const calculateTotal = () => {
    return form.watch("items").reduce((sum, item) => 
      sum + (item.qty * (item.rate || 0)), 0);
  };

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
                        onChange={(e) => {
                          const customerId = Number(e.target.value);
                          field.onChange(customerId);
                          handleCustomerChange(customerId);
                        }}
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

              {/* Challan Number field */}
              <FormField
                control={form.control}
                name="challanNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Challan Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter challan number"
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
                  <FormItem className="col-span-2">
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
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-semibold">Item Details</h2>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ 
                    materialId: 0, 
                    crusherSiteId: undefined, 
                    qty: 0, 
                    rate: 0, 
                    uom: "Ton" 
                  })}
                  className="text-blue-600 border-blue-600"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Crusher Site</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="text-gray-800">
                          <FormField
                            control={form.control}
                            name={`items.${index}.materialId`}
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
                          <FormField
                            control={form.control}
                            name={`items.${index}.crusherSiteId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <select
                                    className="w-full p-2 border border-gray-200 rounded-md text-gray-600"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  >
                                    <option value="">Select Crusher Site</option>
                                    {crusherSites.map((site) => (
                                      <option
                                        key={site.id}
                                        value={site.id}
                                      >
                                        {site.name}
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
                          <FormField
                            control={form.control}
                            name={`items.${index}.uom`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <select
                                    className="w-full p-2 border border-gray-200 rounded-md text-gray-600"
                                    {...field}
                                  >
                                    <option value="Ton">Ton</option>
                                    <option value="Kilo">Kilo</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-gray-800">
                          <FormField
                            control={form.control}
                            name={`items.${index}.qty`}
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
                            name={`items.${index}.rate`}
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
                          }).format(
                            form.watch(`items.${index}.qty`) * 
                            (form.watch(`items.${index}.rate`) || 0)
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-semibold">
                        Total Amount:
                      </TableCell>
                      <TableCell className="text-gray-800 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(calculateTotal())}
                      </TableCell>
                      <TableCell></TableCell>
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
