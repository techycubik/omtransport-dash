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
import { ArrowLeft, ExternalLink } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the Customer type
export interface Customer {
  id: number;
  name: string;
  gstNo?: string;
  address?: string;
  contact?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  maps_link?: string;
}

// Define the form schema
export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z
    .string()
    .optional()
    .refine((value) => !value || validateGSTNumber(value), {
      message:
        "Invalid GST number format. It should be in the format: 22AAAAA0000A1Z5",
    })
    .refine(
      (value) =>
        !value || !validateGSTNumber(value) || getStateFromGST(value) !== null,
      { message: "Invalid state code in the GST number" }
    ),
  address: z.string().optional(),
  contact: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  maps_link: z.string().optional(),
});

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

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  editingCustomer: Customer | null;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel: () => void;
}

export const CustomerForm = React.memo(
  ({ editingCustomer, onSubmit, onCancel }: CustomerFormProps) => {
    // Initialize the form
    const form = useForm<CustomerFormValues>({
      resolver: zodResolver(customerSchema),
      defaultValues: {
        name: editingCustomer?.name || "",
        gstNo: editingCustomer?.gstNo || "",
        address: editingCustomer?.address || "",
        contact: editingCustomer?.contact || "",
        street: editingCustomer?.street || "",
        city: editingCustomer?.city || "",
        state: editingCustomer?.state || "",
        pincode: editingCustomer?.pincode || "",
        maps_link: editingCustomer?.maps_link || "",
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
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        placeholder="Enter customer name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                        GST Number
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className={`p-3 text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300 ${
                              field.value &&
                              (validateGSTNumber(field.value)
                                ? "border-green-400 bg-green-50/20"
                                : "border-red-400 bg-red-50/20")
                            }`}
                            placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                            {...field}
                            onChange={(e) => {
                              // Convert to uppercase
                              const value = e.target.value.toUpperCase();
                              e.target.value = value;
                              field.onChange(e);
                            }}
                          />
                          {field.value && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {validateGSTNumber(field.value) ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {field.value && field.value.length >= 2 && (
                        <div className="mt-1">
                          {getStateFromGST(field.value) ? (
                            <p className="text-xs text-green-600">
                              State: {getStateFromGST(field.value)}
                            </p>
                          ) : (
                            <p className="text-xs text-red-600">
                              Invalid state code
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        GST format: 2 digits state code + 5 char PAN + 4 digit
                        PAN + 1 entity number + Z + check digit
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Contact
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          placeholder="Enter contact information"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          placeholder="Enter street or location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                            placeholder="Enter city"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                            placeholder="Enter state"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                            placeholder="Enter pincode"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                              className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                            />
                            {field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={() =>
                                  window.open(field.value, "_blank")
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
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
                  {editingCustomer ? "Update Customer" : "Add Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    );
  }
);

CustomerForm.displayName = "CustomerForm";

export default CustomerForm;
