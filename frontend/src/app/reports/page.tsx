"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import TableWrapper from "@/components/TableWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, ChevronDown, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { StatusBadge } from "@/components/TableWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the types of views
type ViewType = "purchases" | "sales" | "combined";

// Define the types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Customer {
  id: number;
  name: string;
}

interface Vendor {
  id: number;
  name: string;
}

interface Delivery {
  id: number;
  type: "PURCHASE" | "SALE";
  orderId: number;
  orderType: string;
  entityId: number;
  entityName: string;
  entityAddress?: string;
  entityContact?: string;
  entityPhone?: string;
  materialId: number;
  materialName: string;
  materialUom?: string;
  pickupLocation?: string;
  dropLocation?: string;
  pickupDate: string;
  dropDate?: string;
  pickupQuantity: number;
  dropQuantity?: number;
  difference?: number;
  vehicleNo: string;
  driver?: string;
  deliveryDuration?: number;
  status: string;
  rate?: number;
  amount?: number;
  notes?: string;
}

export default function ReportsPage() {
  const [view, setView] = useState<ViewType>("combined");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set initial states with proper date formatting
  const today = new Date();
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(today), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(today, "yyyy-MM-dd"));

  // Date presets
  const dateRanges = [
    {
      label: "Today",
      start: format(new Date(), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    },
    {
      label: "Yesterday",
      start: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      end: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    },
    {
      label: "Last 7 Days",
      start: format(subDays(new Date(), 7), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    },
    {
      label: "Last 30 Days",
      start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    },
    {
      label: "This Month",
      start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Format dates for API query
        const formattedStartDate = startDate.split('T')[0]; // Ensure we have just the date part
        const formattedEndDate = endDate.split('T')[0]; // Ensure we have just the date part
        
        // Query string with date range
        const query = `startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

        // Fetch delivery data
        const response = await api(`/api/reports/deliveries?${query}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch delivery data: ${response.status}`);
        }
        const data = await response.json();
        setDeliveries(data);

        // Apply initial filtering based on the view
        filterDeliveries(view, data);
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
  }, [startDate, endDate, view]);

  // Filter deliveries based on the selected view
  const filterDeliveries = (viewType: ViewType, data = deliveries) => {
    let filtered;
    switch (viewType) {
      case "purchases":
        filtered = data.filter((d) => d.type === "PURCHASE");
        break;
      case "sales":
        filtered = data.filter((d) => d.type === "SALE");
        break;
      default:
        filtered = data;
    }
    setFilteredDeliveries(filtered);
  };

  // Handle view change
  const handleViewChange = (value: string) => {
    const viewType = value as ViewType;
    setView(viewType);
    filterDeliveries(viewType);
  };

  // Handle date range change
  const handleDateRangeChange = (start: string, end: string) => {
    // Ensure dates are in YYYY-MM-DD format
    try {
      const startFormatted = start.includes('T') ? start.split('T')[0] : start;
      const endFormatted = end.includes('T') ? end.split('T')[0] : end;
      
      setStartDate(startFormatted);
      setEndDate(endFormatted);
    } catch (error) {
      console.error("Error formatting date range:", error);
      // Fallback to original values if there's an error
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Export to PDF function
  const handleExportPDF = async () => {
    try {
      toast.success(`Exporting ${view} report to PDF...`);
      // API call to generate and download PDF would go here
      // For example:
      // const response = await api(`/api/reports/export?view=${view}&startDate=${startDate}&endDate=${endDate}`);
      // if (response.ok) {
      //   const blob = await response.blob();
      //   const url = window.URL.createObjectURL(blob);
      //   const a = document.createElement('a');
      //   a.href = url;
      //   a.download = `${view}-report-${startDate}-to-${endDate}.pdf`;
      //   document.body.appendChild(a);
      //   a.click();
      //   window.URL.revokeObjectURL(url);
      // }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again later.");
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Helper to determine row styling based on status
  const getRowStyle = (delivery: Delivery) => {
    // Flag discrepancies
    if (delivery.difference && delivery.difference !== 0) {
      return "bg-red-50";
    }

    // Flag late deliveries
    if (delivery.deliveryDuration && delivery.deliveryDuration > 2) {
      return "bg-amber-50";
    }

    return "";
  };

  // Dropdown for preset date ranges
  const DateRangeDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const dropdown = document.getElementById("date-dropdown");
        if (dropdown && !dropdown.contains(event.target as Node) && isOpen) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="relative">
        <Button
          variant="outline"
          className="flex gap-2 items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar size={16} />
          Date Presets
          <ChevronDown size={14} />
        </Button>
        <div
          id="date-dropdown"
          className={`absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-md w-40 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <div className="py-1">
            {dateRanges.map((range) => (
              <button
                key={range.label}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  handleDateRangeChange(range.start, range.end);
                  setIsOpen(false);
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell pageTitle="Delivery Reports">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Reports Data</h2>
            <Button
              variant="outline"
              className="flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Download size={16} />
              Export PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex gap-2 items-center">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setStartDate(value);
                    }
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="end-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setEndDate(value);
                    }
                  }}
                />
              </div>
              <div className="mt-5">
                <DateRangeDropdown />
              </div>
            </div>
          </div>

          <Tabs
            value={view}
            onValueChange={handleViewChange}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="combined">Combined View</TabsTrigger>
              <TabsTrigger value="purchases">Purchase View</TabsTrigger>
              <TabsTrigger value="sales">Sales View</TabsTrigger>
            </TabsList>

            <TabsContent value="combined">
              <TableWrapper
                loading={loading}
                isEmpty={filteredDeliveries.length === 0}
                emptyMessage="No delivery data found for the selected date range."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Vehicle/Driver</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Drop Location</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Drop Date</TableHead>
                      <TableHead>Pickup Qty</TableHead>
                      <TableHead>Drop Qty</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow
                        key={`${delivery.type}-${delivery.id}`}
                        className={getRowStyle(delivery)}
                      >
                        <TableCell>
                          <StatusBadge
                            status={delivery.type}
                            colorMap={{
                              PURCHASE: "bg-purple-100 text-purple-800",
                              SALE: "bg-blue-100 text-blue-800",
                            }}
                          />
                        </TableCell>
                        <TableCell>{delivery.orderId}</TableCell>
                        <TableCell>{delivery.entityName}</TableCell>
                        <TableCell>{delivery.entityAddress || "-"}</TableCell>
                        <TableCell>
                          {delivery.materialName}
                          {delivery.materialUom ? ` (${delivery.materialUom})` : ""}
                        </TableCell>
                        <TableCell>
                          {delivery.vehicleNo}
                          {delivery.driver ? ` / ${delivery.driver}` : ""}
                        </TableCell>
                        <TableCell>{delivery.pickupLocation || "-"}</TableCell>
                        <TableCell>{delivery.dropLocation || "-"}</TableCell>
                        <TableCell>{formatDate(delivery.pickupDate)}</TableCell>
                        <TableCell>{formatDate(delivery.dropDate)}</TableCell>
                        <TableCell>{delivery.pickupQuantity}</TableCell>
                        <TableCell>{delivery.dropQuantity ?? "-"}</TableCell>
                        <TableCell
                          className={
                            delivery.difference && delivery.difference !== 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {delivery.difference ?? "-"}
                        </TableCell>
                        <TableCell>{delivery.rate ?? "-"}</TableCell>
                        <TableCell>{delivery.amount ? `₹${delivery.amount.toFixed(2)}` : "-"}</TableCell>
                        <TableCell
                          className={
                            delivery.deliveryDuration &&
                            delivery.deliveryDuration > 2
                              ? "text-amber-600 font-medium"
                              : ""
                          }
                        >
                          {delivery.deliveryDuration
                            ? `${delivery.deliveryDuration} days`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={delivery.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </TabsContent>

            <TabsContent value="purchases">
              <TableWrapper
                loading={loading}
                isEmpty={filteredDeliveries.length === 0}
                emptyMessage="No purchase deliveries found for the selected date range."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchase ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Vehicle/Driver</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Drop Location</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Drop Date</TableHead>
                      <TableHead>Pickup Qty</TableHead>
                      <TableHead>Drop Qty</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow
                        key={`${delivery.type}-${delivery.id}`}
                        className={getRowStyle(delivery)}
                      >
                        <TableCell>{delivery.orderId}</TableCell>
                        <TableCell>{delivery.entityName}</TableCell>
                        <TableCell>{delivery.entityAddress || "-"}</TableCell>
                        <TableCell>
                          {delivery.materialName}
                          {delivery.materialUom ? ` (${delivery.materialUom})` : ""}
                        </TableCell>
                        <TableCell>
                          {delivery.vehicleNo}
                          {delivery.driver ? ` / ${delivery.driver}` : ""}
                        </TableCell>
                        <TableCell>{delivery.pickupLocation || "-"}</TableCell>
                        <TableCell>{delivery.dropLocation || "-"}</TableCell>
                        <TableCell>{formatDate(delivery.pickupDate)}</TableCell>
                        <TableCell>{formatDate(delivery.dropDate)}</TableCell>
                        <TableCell>{delivery.pickupQuantity}</TableCell>
                        <TableCell>{delivery.dropQuantity ?? "-"}</TableCell>
                        <TableCell
                          className={
                            delivery.difference && delivery.difference !== 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {delivery.difference ?? "-"}
                        </TableCell>
                        <TableCell>{delivery.rate ?? "-"}</TableCell>
                        <TableCell>{delivery.amount ? `₹${delivery.amount.toFixed(2)}` : "-"}</TableCell>
                        <TableCell
                          className={
                            delivery.deliveryDuration &&
                            delivery.deliveryDuration > 2
                              ? "text-amber-600 font-medium"
                              : ""
                          }
                        >
                          {delivery.deliveryDuration
                            ? `${delivery.deliveryDuration} days`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={delivery.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </TabsContent>

            <TabsContent value="sales">
              <TableWrapper
                loading={loading}
                isEmpty={filteredDeliveries.length === 0}
                emptyMessage="No sales deliveries found for the selected date range."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sales ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Vehicle/Driver</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Drop Location</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Drop Date</TableHead>
                      <TableHead>Pickup Qty</TableHead>
                      <TableHead>Drop Qty</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow
                        key={`${delivery.type}-${delivery.id}`}
                        className={getRowStyle(delivery)}
                      >
                        <TableCell>{delivery.orderId}</TableCell>
                        <TableCell>{delivery.entityName}</TableCell>
                        <TableCell>{delivery.entityAddress || "-"}</TableCell>
                        <TableCell>
                          {delivery.materialName}
                          {delivery.materialUom ? ` (${delivery.materialUom})` : ""}
                        </TableCell>
                        <TableCell>
                          {delivery.vehicleNo}
                          {delivery.driver ? ` / ${delivery.driver}` : ""}
                        </TableCell>
                        <TableCell>{delivery.pickupLocation || "-"}</TableCell>
                        <TableCell>{delivery.dropLocation || "-"}</TableCell>
                        <TableCell>{formatDate(delivery.pickupDate)}</TableCell>
                        <TableCell>{formatDate(delivery.dropDate)}</TableCell>
                        <TableCell>{delivery.pickupQuantity}</TableCell>
                        <TableCell>{delivery.dropQuantity ?? "-"}</TableCell>
                        <TableCell
                          className={
                            delivery.difference && delivery.difference !== 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {delivery.difference ?? "-"}
                        </TableCell>
                        <TableCell>{delivery.rate ?? "-"}</TableCell>
                        <TableCell>{delivery.amount ? `₹${delivery.amount.toFixed(2)}` : "-"}</TableCell>
                        <TableCell
                          className={
                            delivery.deliveryDuration &&
                            delivery.deliveryDuration > 2
                              ? "text-amber-600 font-medium"
                              : ""
                          }
                        >
                          {delivery.deliveryDuration
                            ? `${delivery.deliveryDuration} days`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={delivery.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  );
}
