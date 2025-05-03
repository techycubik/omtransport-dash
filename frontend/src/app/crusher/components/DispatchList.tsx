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
  Pencil,
  Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format, differenceInDays } from "date-fns";
import DispatchListView from "@/components/views/DispatchListView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<Dispatch | null>(null);
  const [selectedCrusherRun, setSelectedCrusherRun] =
    useState<CrusherRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dispatchToDelete, setDispatchToDelete] = useState<Dispatch | null>(null);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
  
  // Calculate difference between pickup and drop quantities
  const calculateDifference = (pickupQty?: number, dropQty?: number) => {
    if (
      pickupQty === undefined ||
      dropQty === undefined ||
      pickupQty === null ||
      dropQty === null
    ) {
      return null;
    }
    return (pickupQty - dropQty).toFixed(2);
  };
  
  // Filter dispatches based on search term
  const filteredDispatches = searchTerm
    ? dispatches.filter((dispatch) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          dispatch.destination.toLowerCase().includes(searchLower) ||
          dispatch.vehicleNo.toLowerCase().includes(searchLower) ||
          dispatch.CrusherRun?.Material?.name
            ?.toLowerCase()
            .includes(searchLower) ||
          dispatch.deliveryStatus.toLowerCase().includes(searchLower)
        );
      })
    : dispatches;

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
          deliveryStatus: isEditMode 
            ? editingDispatch?.deliveryStatus 
            : "PENDING" as const,
        };

        // Validate that quantity doesn't exceed available
        if (selectedCrusherRun && !isEditMode) {
          const availableQty =
            selectedCrusherRun.producedQty - selectedCrusherRun.dispatchedQty;
          if (values.quantity > availableQty) {
            toast.error(
              `Cannot dispatch more than available quantity (${availableQty})`
            );
            return;
          }
        }

        // Determine if this is an edit or a new dispatch
        const url = isEditMode && editingDispatch 
          ? `/api/crusher/dispatches/${editingDispatch.id}` 
          : "/api/crusher/dispatches";
        const method = isEditMode ? "PUT" : "POST";

        // Send the data to the server
        const response = await api(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(
            `Failed to ${isEditMode ? 'update' : 'create'} dispatch: ${response.status} ${errorText}`
          );
        }

        const resultDispatch = await response.json();

        if (isEditMode) {
          // Update the existing dispatch in the list
          setDispatches(prev => 
            prev.map(d => d.id === resultDispatch.id ? resultDispatch : d)
          );
          
          toast.success("Dispatch updated successfully");
        } else {
          // Add the new dispatch to the list
          setDispatches((prev) => [resultDispatch, ...prev]);
          
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
          
          toast.success("Dispatch created successfully");
        }

        // Reset the form and hide it
        form.reset();
        setSelectedCrusherRun(null);
        setEditingDispatch(null);
        setIsEditMode(false);
        setShowForm(false);
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} dispatch:`, error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? 'update' : 'create'} dispatch. Please try again later.`;

        toast.error(errorMessage);
      }
    },
    [selectedCrusherRun, crusherRuns, form, isEditMode, editingDispatch]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowForm(true);
    setIsEditMode(false);
    setEditingDispatch(null);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setIsEditMode(false);
    setEditingDispatch(null);
  }, []);

  const handleEdit = useCallback((dispatch: Dispatch) => {
    setEditingDispatch(dispatch);
    setIsEditMode(true);
    setShowForm(true);
    
    // Find the crusher run associated with this dispatch
    const run = crusherRuns.find((r) => r.id === dispatch.crusherRunId);
    if (run) {
      setSelectedCrusherRun(run);
    }
    
    // Prefill the form with dispatch data
    form.reset({
      crusherRunId: dispatch.crusherRunId,
      salesOrderId: dispatch.salesOrderId || 0,
      dispatchDate: dispatch.dispatchDate.split('T')[0],
      quantity: dispatch.quantity,
      destination: dispatch.destination,
      vehicleNo: dispatch.vehicleNo,
      driver: dispatch.driver || "",
      pickupQuantity: dispatch.pickupQuantity,
      dropQuantity: dispatch.dropQuantity,
    });
  }, [crusherRuns, form]);

  const handleDelete = useCallback((dispatch: Dispatch) => {
    setDispatchToDelete(dispatch);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!dispatchToDelete) return;
    
    try {
      const response = await api(`/api/crusher/dispatches/${dispatchToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete dispatch: ${response.status}`);
      }

      // Update local state by removing the deleted dispatch
      setDispatches((prev) => prev.filter((d) => d.id !== dispatchToDelete.id));
      
      // If there was a crusher run, update its dispatched quantity
      if (dispatchToDelete.crusherRunId) {
        setCrusherRuns(prevRuns => 
          prevRuns.map(run => {
            if (run.id === dispatchToDelete.crusherRunId) {
              return {
                ...run,
                dispatchedQty: Math.max(0, run.dispatchedQty - dispatchToDelete.quantity)
              };
            }
            return run;
          })
        );
      }

      toast.success("Dispatch deleted successfully");
      setIsDeleteDialogOpen(false);
      setDispatchToDelete(null);
    } catch (error) {
      console.error("Error deleting dispatch:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete dispatch. Please try again later.";

      toast.error(errorMessage);
    }
  }, [dispatchToDelete]);

  return (
    <Card className="p-6">
      {showForm ? (
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-2 p-0 hover:bg-transparent"
              onClick={() => setShowForm(false)}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold">
              {isEditMode ? "Edit Dispatch" : "Add New Dispatch"}
            </h2>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                              const availableQty = run.producedQty - run.dispatchedQty;
                              form.setValue("quantity", availableQty > 0 ? availableQty : 0);
                            } else {
                              setSelectedCrusherRun(null);
                            }
                          }}
                        >
                          <option value={0}>Select Production Batch</option>
                          {crusherRuns.map((run) => {
                            const availableQty = run.producedQty - run.dispatchedQty;
                            return (
                              <option key={run.id} value={run.id} disabled={availableQty <= 0}>
                                ID: {run.id} - {run.Material?.name} ({availableQty} {" "}
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
                            .filter((order) => !selectedCrusherRun || order.materialId === selectedCrusherRun.materialId)
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
                          max={selectedCrusherRun ? selectedCrusherRun.producedQty - selectedCrusherRun.dispatchedQty : 0}
                        />
                      </FormControl>
                      {selectedCrusherRun && (
                        <p className="text-xs text-gray-500">
                          Available: {selectedCrusherRun.producedQty - selectedCrusherRun.dispatchedQty}{" "}
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

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-black hover:bg-primary/90"
                >
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search dispatches..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-black hover:bg-primary/90" 
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              Add New Dispatch
            </button>
          </div>
          
          <TableWrapper
            loading={loading}
            isEmpty={filteredDispatches.length === 0}
            emptyMessage="No dispatches found."
            searchTerm={searchTerm}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Pickup Qty</TableHead>
                  <TableHead>Drop Qty</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDispatches.map((dispatch) => {
                  const difference = calculateDifference(
                    dispatch.pickupQuantity,
                    dispatch.dropQuantity
                  );
                  
                  return (
                    <TableRow key={dispatch.id}>
                      <TableCell>{formatDate(dispatch.dispatchDate)}</TableCell>
                      <TableCell>
                        {dispatch.CrusherRun?.Material?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{dispatch.destination}</TableCell>
                      <TableCell>{dispatch.vehicleNo}</TableCell>
                      <TableCell>
                        {dispatch.quantity}{" "}
                        {dispatch.CrusherRun?.Material?.uom || ""}
                      </TableCell>
                      <TableCell>{dispatch.pickupQuantity ?? "-"}</TableCell>
                      <TableCell>{dispatch.dropQuantity ?? "-"}</TableCell>
                      <TableCell
                        className={
                          difference && parseFloat(difference) !== 0
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {difference !== null ? difference : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={dispatch.deliveryStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 text-gray-700 hover:bg-gray-50"
                            onClick={() => handleEdit(dispatch)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 text-red-500 hover:bg-gray-50"
                            onClick={() => handleDelete(dispatch)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>
            This will permanently delete the dispatch order.
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
