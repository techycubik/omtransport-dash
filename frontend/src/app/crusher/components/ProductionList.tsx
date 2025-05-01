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
import { Plus, ArrowLeft, X, Search, FileText } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

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

interface CrusherRun {
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

type FormValues = z.infer<typeof formSchema>;

export default function ProductionList() {
  const [production, setProduction] = useState<CrusherRun[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machines, setMachines] = useState<CrusherMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialId: 0,
      machineId: 0,
      inputQty: 0,
      producedQty: 0,
      runDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Fetch production data, materials, and machines
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch production data
        const productionResponse = await api("/api/crusher/runs");
        if (!productionResponse.ok) {
          throw new Error(
            `Failed to fetch production data: ${productionResponse.status}`
          );
        }
        const productionData = await productionResponse.json();
        setProduction(productionData);

        // Fetch materials
        const materialsResponse = await api("/api/materials");
        if (!materialsResponse.ok) {
          throw new Error(
            `Failed to fetch materials: ${materialsResponse.status}`
          );
        }
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData);

        // Fetch machines
        const machinesResponse = await api("/api/crusher/machines");
        if (!machinesResponse.ok) {
          throw new Error(
            `Failed to fetch machines: ${machinesResponse.status}`
          );
        }
        const machinesData = await machinesResponse.json();
        setMachines(machinesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load data. Please try again later.";

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      // Log the form values for debugging
      console.log("Form values:", values);

      // Format date as ISO string
      const formattedValues = {
        ...values,
        runDate: new Date(values.runDate).toISOString(),
        dispatchedQty: 0,
        status: "PENDING",
      };

      // Send the data to the server
      const response = await api("/api/crusher/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to create production entry: ${response.status} ${errorText}`
        );
      }

      // Add the new production entry to the list
      const newProduction = await response.json();
      setProduction((prev) => [newProduction, ...prev]);

      // Reset the form and hide it
      form.reset();
      setShowForm(false);
      toast.success("Production entry created successfully");
    } catch (error) {
      console.error("Error creating production entry:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create production entry. Please try again later.";

      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Calculate yield percentage
  const calculateYield = (inputQty: number, producedQty: number) => {
    if (inputQty <= 0) return 0;
    return Math.round((producedQty / inputQty) * 100);
  };

  // Filter production data based on search term
  const filteredProduction = searchTerm
    ? production.filter(
        (p) =>
          p.Material?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.Machine?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : production;

  const ProductionForm = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Add Production Entry</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowForm(false)}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Production Entry</Button>
          </div>
        </form>
      </Form>
    </>
  );

  const ProductionListView = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by material or machine..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          New Production Entry
        </Button>
      </div>

      <TableWrapper
        loading={loading}
        isEmpty={filteredProduction.length === 0}
        emptyMessage="No production data found."
        searchTerm={searchTerm}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead>Input Qty</TableHead>
              <TableHead>Output Qty</TableHead>
              <TableHead>Yield %</TableHead>
              <TableHead>Dispatched</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProduction.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{formatDate(run.runDate)}</TableCell>
                <TableCell>{run.Material?.name || "Unknown"}</TableCell>
                <TableCell>{run.Machine?.name || "Unknown"}</TableCell>
                <TableCell>
                  {run.inputQty} {run.Material?.uom}
                </TableCell>
                <TableCell>
                  {run.producedQty} {run.Material?.uom}
                </TableCell>
                <TableCell>
                  {calculateYield(run.inputQty, run.producedQty)}%
                </TableCell>
                <TableCell>
                  {run.dispatchedQty} {run.Material?.uom}
                </TableCell>
                <TableCell>
                  <StatusBadge status={run.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <FileText size={16} />
                  </Button>
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
      {showForm ? <ProductionForm /> : <ProductionListView />}
    </Card>
  );
}
