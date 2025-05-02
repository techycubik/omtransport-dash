"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Plus,
  ArrowLeft,
  X,
  Search,
  FileText,
  TrendingDown,
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format, differenceInDays } from "date-fns";
import DispatchListView from "@/components/views/DispatchListView";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Customer {
  id: number;
  name: string;
}

interface CrusherRun {
  id: number;
  materialId: number;
  producedQty: number;
  dispatchedQty: number;
  Material?: Material;
}

interface SalesOrder {
  id: number;
  customerId: number;
  materialId: number;
  qty: number;
  Customer?: Customer;
}

interface Dispatch {
  id: number;
  crusherRunId: number;
  salesOrderId?: number;
  dispatchDate: string;
  quantity: number;
  destination: string;
  vehicleNo: string;
  driver?: string;
  pickupQuantity?: number;
  dropQuantity?: number;
  deliveryStatus: "PENDING" | "IN_TRANSIT" | "DELIVERED";
  deliveryDuration?: number;
  CrusherRun?: CrusherRun;
  SalesOrder?: SalesOrder;
}

// Define the form schema
const formSchema = z.object({
  crusherRunId: z.coerce.number().positive("Please select a production batch"),
  salesOrderId: z.coerce.number().optional(),
  dispatchDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  destination: z.string().min(1, "Destination is required"),
  vehicleNo: z.string().min(1, "Vehicle number is required"),
  driver: z.string().optional(),
  pickupQuantity: z.coerce.number().optional(),
  dropQuantity: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DispatchList() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [crusherRuns, setCrusherRuns] = useState<CrusherRun[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCrusherRun, setSelectedCrusherRun] =
    useState<CrusherRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crusherRunId: 0,
      salesOrderId: 0,
      dispatchDate: format(new Date(), "yyyy-MM-dd"),
      quantity: 0,
      destination: "",
      vehicleNo: "",
      driver: "",
      pickupQuantity: undefined,
      dropQuantity: undefined,
    },
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dispatches
      const dispatchesResponse = await api("/api/crusher/dispatches");
      if (!dispatchesResponse.ok) {
        throw new Error(
          `Failed to fetch dispatches: ${dispatchesResponse.status}`
        );
      }
      const dispatchesData = await dispatchesResponse.json();
      setDispatches(dispatchesData);

      // Fetch crusher runs
      const runsResponse = await api("/api/crusher/runs");
      if (!runsResponse.ok) {
        throw new Error(
          `Failed to fetch production data: ${runsResponse.status}`
        );
      }
      const runsData = await runsResponse.json();
      // Filter to only include runs with available quantity
      const availableRuns = runsData.filter(
        (run: CrusherRun) => run.producedQty > run.dispatchedQty
      );
      setCrusherRuns(availableRuns);

      // Fetch sales orders
      const salesResponse = await api("/api/sales");
      if (!salesResponse.ok) {
        throw new Error(
          `Failed to fetch sales orders: ${salesResponse.status}`
        );
      }
      const salesData = await salesResponse.json();
      setSalesOrders(salesData);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update available quantity when crusher run changes
  useEffect(() => {
    const crusherRunId = form.getValues().crusherRunId;
    if (crusherRunId) {
      const run = crusherRuns.find((r) => r.id === Number(crusherRunId));
      if (run) {
        setSelectedCrusherRun(run);
        const availableQty = run.producedQty - run.dispatchedQty;
        form.setValue("quantity", availableQty > 0 ? availableQty : 0);
      }
    }
  }, [form, crusherRuns]);

  const handleFormSubmit = useCallback(
    async (values: FormValues) => {
      try {
        // Format date as ISO string
        const formattedValues = {
          ...values,
          dispatchDate: new Date(values.dispatchDate).toISOString(),
          salesOrderId:
            values.salesOrderId && values.salesOrderId > 0
              ? values.salesOrderId
              : undefined,
          deliveryStatus: "PENDING" as const,
        };

        // Validate that quantity doesn't exceed available
        if (selectedCrusherRun) {
          const availableQty =
            selectedCrusherRun.producedQty - selectedCrusherRun.dispatchedQty;
          if (values.quantity > availableQty) {
            toast.error(
              `Cannot dispatch more than available quantity (${availableQty})`
            );
            return;
          }
        }

        // Send the data to the server
        const response = await api("/api/crusher/dispatches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(
            `Failed to create dispatch: ${response.status} ${errorText}`
          );
        }

        // Add the new dispatch to the list
        const newDispatch = await response.json();
        setDispatches((prev) => [newDispatch, ...prev]);

        // Update the crusher run's dispatched quantity
        if (selectedCrusherRun) {
          const updatedRun = {
            ...selectedCrusherRun,
            dispatchedQty: selectedCrusherRun.dispatchedQty + values.quantity,
          };
          setCrusherRuns(
            crusherRuns.map((run) =>
              run.id === selectedCrusherRun.id ? updatedRun : run
            )
          );
        }

        // Reset the form and hide it
        form.reset();
        setSelectedCrusherRun(null);
        setShowForm(false);
        toast.success("Dispatch created successfully");
      } catch (error) {
        console.error("Error creating dispatch:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create dispatch. Please try again later.";

        toast.error(errorMessage);
      }
    },
    [selectedCrusherRun, crusherRuns, form]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const DispatchForm = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Create Dispatch</h2>
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
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="crusherRunId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production Batch</FormLabel>
                  <FormControl>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        const runId = Number(e.target.value);
                        const run = crusherRuns.find((r) => r.id === runId);
                        if (run) {
                          setSelectedCrusherRun(run);
                          const availableQty =
                            run.producedQty - run.dispatchedQty;
                          form.setValue(
                            "quantity",
                            availableQty > 0 ? availableQty : 0
                          );
                        } else {
                          setSelectedCrusherRun(null);
                        }
                      }}
                    >
                      <option value={0}>Select Production Batch</option>
                      {crusherRuns.map((run) => {
                        const availableQty =
                          run.producedQty - run.dispatchedQty;
                        return (
                          <option
                            key={run.id}
                            value={run.id}
                            disabled={availableQty <= 0}
                          >
                            ID: {run.id} - {run.Material?.name} ({availableQty}{" "}
                            {run.Material?.uom} available)
                          </option>
                        );
                      })}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Order (Optional)</FormLabel>
                  <FormControl>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                      value={field.value || 0}
                      onChange={field.onChange}
                    >
                      <option value={0}>None (Direct Dispatch)</option>
                      {salesOrders
                        .filter(
                          (order) =>
                            !selectedCrusherRun ||
                            order.materialId === selectedCrusherRun.materialId
                        )
                        .map((order) => (
                          <option key={order.id} value={order.id}>
                            ID: {order.id} - {order.Customer?.name}
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispatch Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      max={
                        selectedCrusherRun
                          ? selectedCrusherRun.producedQty -
                            selectedCrusherRun.dispatchedQty
                          : 0
                      }
                    />
                  </FormControl>
                  {selectedCrusherRun && (
                    <p className="text-xs text-gray-500">
                      Available:{" "}
                      {selectedCrusherRun.producedQty -
                        selectedCrusherRun.dispatchedQty}{" "}
                      {selectedCrusherRun.Material?.uom}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dispatchDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispatch Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
            <Button type="submit">Create Dispatch</Button>
          </div>
        </form>
      </Form>
    </>
  );

  return (
    <Card className="p-6">
      {showForm ? (
        <DispatchForm />
      ) : (
        <DispatchListView
          dispatches={dispatches}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddNew={handleAddNew}
          loading={loading}
        />
      )}
    </Card>
  );
}
