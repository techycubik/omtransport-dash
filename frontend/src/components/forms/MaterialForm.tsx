import React from "react";
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
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the Material type
export interface Material {
  id: number;
  name: string;
  uom: string;
}

// Define the form schema
export const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  uom: z.string().min(1, "Unit of Measurement is required"),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  onSubmit: (values: MaterialFormValues) => Promise<void>;
  onCancel: () => void;
}

export const MaterialForm = React.memo(
  ({ onSubmit, onCancel }: MaterialFormProps) => {
    // Initialize the form
    const form = useForm<MaterialFormValues>({
      resolver: zodResolver(materialSchema),
      defaultValues: {
        name: "",
        uom: "",
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
        </div>

        <Card className="p-10 bg-white border border-gray-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter material name"
                        {...field}
                        className="bg-white text-gray-800 border-gray-300 placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Unit of Measurement *
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="bg-white w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select unit</option>
                        <option value="kg">Kg</option>
                        <option value="ton">Ton</option>
                        <option value="liter">Liter</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
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
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save Material"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    );
  }
);

MaterialForm.displayName = "MaterialForm";

export default MaterialForm;
