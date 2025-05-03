import React, { useState } from "react";
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
import { Alert } from "@/components/ui/alert";

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

// Function to validate GST number format
export const validateGSTNumber = (gst: string): boolean => {
  // GST format: 2 digits state code + 10 char PAN + 1 entity number + 1 Z + 1 check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

// Function to get state name from GST state code
export const getStateFromGST = (gst: string): string | null => {
  if (!gst || gst.length < 2) return null;

  const stateCode = gst.substring(0, 2);
  const states: { [key: string]: string } = {
    "01": "Jammu and Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "26": "Dadra and Nagar Haveli and Daman and Diu",
    "27": "Maharashtra",
    "28": "Andhra Pradesh",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman and Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh (New)",
    "38": "Ladakh",
    "97": "Other Territory",
    "99": "Centre Jurisdiction",
  };

  return states[stateCode] || null;
};

// Define the form schema using zod
export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z
    .string()
    .min(1, "GST Number is required")
    .refine((value) => !value || validateGSTNumber(value), {
      message:
        "Invalid GST number format. It should be in the format: 22AAAAA0000A1Z5",
    })
    .refine(
      (value) =>
        !value || !validateGSTNumber(value) || getStateFromGST(value) !== null,
      { message: "Invalid state code in the GST number" }
    ),
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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Handle form submission with error handling
    const handleFormSubmit = async (values: VendorFormValues) => {
      setSubmitError(null);
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
        
        // Display error message
        if (error instanceof Error) {
          const errorMessage = error.message;
          
          // Handle GST number duplicate error specifically
          if (errorMessage.includes("GST number already exists")) {
            setSubmitError("A vendor with this GST number already exists.");
            form.setError("gstNo", { 
              type: "manual", 
              message: "This GST number is already in use by another vendor" 
            });
          } else {
            setSubmitError(errorMessage);
          }
        } else {
          setSubmitError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            {editingVendor ? "Edit Vendor" : "Add New Vendor"}
          </h1>
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
          {submitError && (
            <Alert className="mb-6 bg-red-50 text-red-800 border border-red-200 p-4">
              {submitError}
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                        <div className="relative">
                          <Input
                            placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                            {...field}
                            className={`p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300 ${
                              field.value &&
                              (validateGSTNumber(field.value)
                                ? "border-green-400 bg-green-50/20"
                                : "border-red-400 bg-red-50/20")
                            }`}
                            onChange={(e) => {
                              // Convert to uppercase
                              const value = e.target.value.toUpperCase();
                              e.target.value = value;
                              field.onChange(e);
                              
                              // Clear any manual error when user types
                              if (form.formState.errors.gstNo?.type === "manual") {
                                form.clearErrors("gstNo");
                              }
                              
                              // Clear submit error when user makes changes
                              if (submitError) {
                                setSubmitError(null);
                              }
                            }}
                          />
                        </div>
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
                              placeholder="Enter Google Maps link"
                              {...field}
                              className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 text-gray-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editingVendor ? "Update Vendor" : "Create Vendor"}
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
