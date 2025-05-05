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

// Define the Vendor type
export interface Vendor {
  id: number;
  name: string;
  gstNo?: string;
  contact?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  maps_link?: string;
}

// Define the form schema using zod
export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z.string().min(1, "GST Number is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  maps_link: z.string().optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  editingVendor: Vendor | null;
  onSubmit: (values: VendorFormValues) => Promise<void>;
  onCancel: () => void;
}

export const VendorForm = React.memo(
  ({ editingVendor, onSubmit, onCancel }: VendorFormProps) => {
    // Initialize the form
    const form = useForm<VendorFormValues>({
      resolver: zodResolver(vendorSchema),
      defaultValues: {
        name: editingVendor?.name || "",
        gstNo: editingVendor?.gstNo || "",
        contact: editingVendor?.contact || "",
        address: editingVendor?.address || "",
        street: editingVendor?.street || "",
        city: editingVendor?.city || "",
        state: editingVendor?.state || "",
        pincode: editingVendor?.pincode || "",
        maps_link: editingVendor?.maps_link || "",
      },
    });

    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mr-2 text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1 text-gray-800" />
            <span className="text-gray-800">Back</span>
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
                        placeholder="Enter vendor name"
                        {...field}
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gstNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        GST Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter GST number"
                          {...field}
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Contact *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter contact information"
                          {...field}
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Address Details
                </h3>

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Street/Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter street or location"
                          {...field}
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold">
                          City
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            {...field}
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold">
                          State
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter state"
                            {...field}
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold">
                          Pincode
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter pincode"
                            {...field}
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maps_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold">
                          Google Maps Link
                        </FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input
                              placeholder="Enter Google Maps URL"
                              {...field}
                              className="p-3 bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 placeholder:font-thin"
                            />
                            {field.value && (
                              <a
                                href={field.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 flex items-center justify-center rounded-r-md"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="bg-white text-gray-800 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editingVendor ? "Update Vendor" : "Add Vendor"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    );
  }
);

VendorForm.displayName = "VendorForm";

export default VendorForm;
