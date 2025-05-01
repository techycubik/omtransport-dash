"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TableWrapper from "@/components/TableWrapper";
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
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/TableWrapper";
import { Plus, ArrowLeft, X, Search, Settings, Power } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Define the machine type
interface CrusherMachine {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  lastMaintenanceDate: string;
  createdAt?: string;
  updatedAt?: string;
}

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

type FormValues = z.infer<typeof formSchema>;

export default function MachineList() {
  const [machines, setMachines] = useState<CrusherMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<CrusherMachine | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
      lastMaintenanceDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Fetch machines
  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api("/api/crusher/machines");
        if (!response.ok) {
          throw new Error(`Failed to fetch machines: ${response.status}`);
        }
        const data = await response.json();
        setMachines(data);
      } catch (error) {
        console.error("Error fetching machines:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load machines. Please try again later.";

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

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

  const onSubmit = async (values: FormValues) => {
    try {
      // Format date as ISO string
      const formattedValues = {
        ...values,
        lastMaintenanceDate: new Date(values.lastMaintenanceDate).toISOString(),
      };

      let response;
      let successMessage;

      if (editingMachine) {
        // Update existing machine
        response = await api(`/api/crusher/machines/${editingMachine.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        });
        successMessage = "Machine updated successfully";
      } else {
        // Create new machine
        response = await api("/api/crusher/machines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        });
        successMessage = "Machine created successfully";
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to save machine: ${response.status} ${errorText}`
        );
      }

      const savedMachine = await response.json();

      if (editingMachine) {
        // Update the machine in the list
        setMachines(
          machines.map((m) => (m.id === editingMachine.id ? savedMachine : m))
        );
      } else {
        // Add the new machine to the list
        setMachines([savedMachine, ...machines]);
      }

      // Reset the form and hide it
      setEditingMachine(null);
      setShowForm(false);
      toast.success(successMessage);
    } catch (error) {
      console.error("Error saving machine:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save machine. Please try again later.";

      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (machine: CrusherMachine) => {
    try {
      // Determine the new status
      const newStatus = machine.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      // Update the machine status
      const response = await api(`/api/crusher/machines/${machine.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to update machine status: ${response.status} ${errorText}`
        );
      }

      const updatedMachine = await response.json();

      // Update the machine in the list
      setMachines(
        machines.map((m) => (m.id === machine.id ? updatedMachine : m))
      );

      toast.success(
        `Machine ${updatedMachine.name} is now ${updatedMachine.status}`
      );
    } catch (error) {
      console.error("Error updating machine status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update machine status. Please try again later.";

      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Filter machines based on search term
  const filteredMachines = searchTerm
    ? machines.filter(
        (machine) =>
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : machines;

  const MachineForm = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {editingMachine ? "Edit Machine" : "Add New Machine"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowForm(false);
            setEditingMachine(null);
          }}
          className="text-gray-500"
        >
          <X size={18} />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingMachine(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Machine</Button>
          </div>
        </form>
      </Form>
    </>
  );

  const MachineListView = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search machines..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Add Machine
        </Button>
      </div>

      <TableWrapper
        loading={loading}
        isEmpty={filteredMachines.length === 0}
        emptyMessage="No machines found."
        searchTerm={searchTerm}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.name}</TableCell>
                <TableCell>
                  <StatusBadge status={machine.status} />
                </TableCell>
                <TableCell>{formatDate(machine.lastMaintenanceDate)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500"
                      onClick={() => {
                        setEditingMachine(machine);
                        setShowForm(true);
                      }}
                    >
                      <Settings size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${
                        machine.status === "ACTIVE"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                      onClick={() => handleToggleStatus(machine)}
                    >
                      <Power size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </>
  );

  return (
    <Card className="p-6">
      {showForm ? <MachineForm /> : <MachineListView />}
    </Card>
  );
}
