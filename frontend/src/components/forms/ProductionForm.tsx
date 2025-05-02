import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { X } from "lucide-react";
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

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface CrusherMachine {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  lastMaintenanceDate: string;
}

export interface CrusherRun {
  id: number;
  materialId: number;
  machineId: number;
  inputQty: number;
  producedQty: number;
  dispatchedQty: number;
  runDate: string;
  status: "PENDING" | "COMPLETED" | "PARTIALLY_DISPATCHED" | "FULLY_DISPATCHED";
  Machine?: CrusherMachine;
  Material?: Material;
}

// Define the form schema
const formSchema = z.object({
  materialId: z.coerce.number().positive("Please select a material"),
  machineId: z.coerce.number().positive("Please select a machine"),
  inputQty: z.coerce.number().positive("Input quantity must be positive"),
  producedQty: z.coerce.number().positive("Output quantity must be positive"),
  runDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
});

export type ProductionFormValues = z.infer<typeof formSchema>;

interface ProductionFormProps {
  materials: Material[];
  machines: CrusherMachine[];
  onSubmit: (values: ProductionFormValues) => Promise<void>;
  onCancel: () => void;
}

export const ProductionForm = React.memo(
  ({ materials, machines, onSubmit, onCancel }: ProductionFormProps) => {
    // Initialize form
    const form = useForm<ProductionFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        materialId: 0,
        machineId: 0,
        inputQty: 0,
        producedQty: 0,
        runDate: format(new Date(), "yyyy-MM-dd"),
      },
    });

    const handleFormSubmit = form.handleSubmit(onSubmit);

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Production Entry</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-gray-500"
          >
            <X size={18} />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="materialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value={0}>Select Material</option>
                        {materials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name} ({material.uom})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value={0}>Select Machine</option>
                        {machines
                          .filter((machine) => machine.status === "ACTIVE")
                          .map((machine) => (
                            <option key={machine.id} value={machine.id}>
                              {machine.name}
                            </option>
                          ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inputQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="producedQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="runDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Production Entry</Button>
            </div>
          </form>
        </Form>
      </>
    );
  }
);

ProductionForm.displayName = "ProductionForm";

export default ProductionForm;
