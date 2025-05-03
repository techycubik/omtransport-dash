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
import { CrusherMachine } from "../views/MachineListView";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Machine name is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  lastMaintenanceDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
});

export type MachineFormValues = z.infer<typeof formSchema>;

interface MachineFormProps {
  editingMachine: CrusherMachine | null;
  onSubmit: (values: MachineFormValues) => Promise<void>;
  onCancel: () => void;
}

export const MachineForm = React.memo(
  ({ editingMachine, onSubmit, onCancel }: MachineFormProps) => {
    // Initialize form
    const form = useForm<MachineFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        status: "ACTIVE",
        lastMaintenanceDate: format(new Date(), "yyyy-MM-dd"),
      },
    });

    // Set form values when editing
    useEffect(() => {
      if (editingMachine) {
        form.reset({
          name: editingMachine.name,
          status: editingMachine.status,
          lastMaintenanceDate: editingMachine.lastMaintenanceDate.split("T")[0],
        });
      } else {
        form.reset({
          name: "",
          status: "ACTIVE",
          lastMaintenanceDate: format(new Date(), "yyyy-MM-dd"),
        });
      }
    }, [editingMachine, form]);

    const handleFormSubmit = form.handleSubmit(onSubmit);

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {editingMachine ? "Edit Machine" : "Add New Machine"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastMaintenanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Maintenance Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" 
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </form>
        </Form>
      </>
    );
  }
);

MachineForm.displayName = "MachineForm";

export default MachineForm;
