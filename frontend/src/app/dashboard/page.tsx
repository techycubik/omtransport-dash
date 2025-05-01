"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import toast from "react-hot-toast";
import AppShell from "@/components/AppShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ListTodo,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  ChevronRight,
  Download,
  ArrowLeft,
  ArrowRight,
  Plus,
  Send,
  FileText,
  MoreHorizontal,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";

// Define types for our data
interface KPIData {
  todaysDispatch: number;
  pendingPurchases: number;
  variancePct: number;
  topMaterial: string;
}

interface WeeklyData {
  day: string;
  sold: number;
  purchased: number;
}

// Interface for transport transaction data
interface TransportData {
  id: number;
  challanNo: string;
  vehicleNo: string;
  material: string;
  purchasedFrom: string;
  pickupDate: string;
  pickupQty: number;
  buyRate: number;
  buyAmount: number;
  soldTo: string;
  dropDate: string;
  dropQty: number;
  sellRate: number;
  sellAmount: number;
  difference: number;
  amountInclusiveGST: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[] | null>(null);
  const [transportData, setTransportData] = useState<TransportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"purchase" | "sale">("purchase");

  const purchaseColumns = [
    { header: "Sr", key: "index" },
    { header: "Challan No.", key: "challanNo" },
    { header: "Vehicle No.", key: "vehicleNo" },
    { header: "Material", key: "material" },
    { header: "Purchased From", key: "purchasedFrom" },
    { header: "Date", key: "pickupDate" },
    { header: "Qty.", key: "pickupQty" },
    { header: "Rate", key: "buyRate" },
    { header: "Amount", key: "buyAmount" },
  ];

  const saleColumns = [
    { header: "Sr ", key: "index" },
    { header: "Challan No", key: "challanNo" },
    { header: "Vehicle No.", key: "vehicleNo" },
    { header: "Material", key: "material" },
    { header: "Sold To", key: "soldTo" },
    { header: "Date", key: "dropDate" },
    { header: "Qty", key: "dropQty" },
    { header: "Rate", key: "sellRate" },
    { header: "Amount", key: "sellAmount" },
    { header: "Diff", key: "difference" },
    { header: "Amount Inclusive GST", key: "amountInclusiveGST" },
  ];

  // Mock data for cash flow chart
  const cashFlowData = [
    { date: "18 Oct", income: 2500, expense: 1800 },
    { date: "20 Oct", income: 3200, expense: 2100 },
    { date: "22 Oct", income: 2800, expense: 2000 },
    { date: "24 Oct", income: 3800, expense: 2300 },
    { date: "26 Oct", income: 2900, expense: 2500 },
    { date: "28 Oct", income: 3400, expense: 2200 },
    { date: "30 Oct", income: 3100, expense: 1900 },
    { date: "1 Nov", income: 3600, expense: 2400 },
    { date: "3 Nov", income: 2700, expense: 2000 },
    { date: "5 Nov", income: 3300, expense: 2100 },
    { date: "7 Nov", income: 3500, expense: 2300 },
    { date: "9 Nov", income: 3000, expense: 2100 },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch KPI data
        const kpiResponse = await api("/api/reports/kpis");
        if (!kpiResponse.ok) {
          const errorData = await kpiResponse.json().catch(() => ({}));
          console.error("KPI error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch KPI data");
        }
        const kpiResult = await kpiResponse.json();
        setKpiData(kpiResult);

        // Fetch weekly data
        const weeklyResponse = await api("/api/reports/weekly");
        if (!weeklyResponse.ok) {
          const errorData = await weeklyResponse.json().catch(() => ({}));
          console.error("Weekly data error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch weekly data");
        }
        const weeklyResult = await weeklyResponse.json();
        setWeeklyData(weeklyResult);

        // Fetch transport data
        const transportResponse = await api("/api/reports/transactions");
        if (!transportResponse.ok) {
          const errorData = await transportResponse.json().catch(() => ({}));
          console.error("Transaction error response:", errorData);
          throw new Error(
            errorData.error || "Failed to fetch transaction data"
          );
        }
        const transportResult = await transportResponse.json();
        setTransportData(transportResult);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data. Please try again later.");

        // Only use mock data in development if there was an error
        if (process.env.NODE_ENV === "development") {
          console.log("Using mock data for development");
          provideMockData();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to provide mock data
  const provideMockData = () => {
    setKpiData({
      todaysDispatch: 145,
      pendingPurchases: 12,
      variancePct: 3.2,
      topMaterial: "Gravel",
    });

    setWeeklyData([
      { day: "Mon", sold: 20, purchased: 18 },
      { day: "Tue", sold: 15, purchased: 12 },
      { day: "Wed", sold: 25, purchased: 22 },
      { day: "Thu", sold: 22, purchased: 20 },
      { day: "Fri", sold: 30, purchased: 28 },
      { day: "Sat", sold: 18, purchased: 15 },
      { day: "Sun", sold: 10, purchased: 8 },
    ]);

    // Mock transport data
    setTransportData([
      {
        id: 1,
        challanNo: "1326",
        vehicleNo: "KA.05.AN.9144",
        material: "M.SAND",
        purchasedFrom: "AMB TRADERS",
        pickupDate: "16-08-2023",
        pickupQty: 35.203,
        buyRate: 609.52,
        buyAmount: 21517,
        soldTo: "NUVOCO ANJANAPURA",
        dropDate: "16-08-2023",
        dropQty: 35.735,
        sellRate: 670,
        sellAmount: 23942,
        difference: 2425.47,
        amountInclusiveGST: 26253,
      },
      {
        id: 2,
        challanNo: "1327",
        vehicleNo: "KA.05.AN.9036",
        material: "M.SAND",
        purchasedFrom: "AMB TRADERS",
        pickupDate: "22-08-2023",
        pickupQty: 35.856,
        buyRate: 609.52,
        buyAmount: 21733,
        soldTo: "NUVOCO ANJANAPURA",
        dropDate: "22-08-2023",
        dropQty: 36.656,
        sellRate: 670,
        sellAmount: 23890,
        difference: 2156.47,
        amountInclusiveGST: 25984,
      },
      {
        id: 3,
        challanNo: "1328",
        vehicleNo: "KA.05.AN.9144",
        material: "M.SAND",
        purchasedFrom: "AMB TRADERS",
        pickupDate: "23-08-2023",
        pickupQty: 37.413,
        buyRate: 609.52,
        buyAmount: 22860,
        soldTo: "NUVOCO ANJANAPURA",
        dropDate: "23-08-2023",
        dropQty: 37.413,
        sellRate: 670,
        sellAmount: 25067,
        difference: 2282.74,
        amountInclusiveGST: 27573,
      },
    ]);
  };

  return (
    <AppShell pageTitle="Dashboard">
      {/* Main Balance Card */}
      <div className="mb-8">
        <Card className="bg-white shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Balance
              </h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900 mr-2">
                  ₹ 320,845.20
                </span>
                <span className="text-sm font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="mr-1" size={14} />
                  12.8%
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-sequence btn-sequence-primary">
                <Plus size={16} />
                Add
              </button>
              <button className="btn-sequence btn-sequence-secondary">
                <Send size={16} />
                Send
              </button>
              <button className="btn-sequence btn-sequence-secondary">
                <FileText size={16} />
                Request
              </button>
              <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Income Card */}
            <Card>
              <CardContent className="stat-card">
                <div className="flex justify-between items-start">
                  <span className="stat-card-title">Income</span>
                  <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="stat-card-value">₹ 12,378.20</span>
                </div>
                <div className="trend-badge trend-badge-positive mt-2">
                  <ArrowUpRight size={12} className="mr-1" /> 45.0%
                </div>
              </CardContent>
            </Card>

            {/* Expense Card */}
            <Card>
              <CardContent className="stat-card">
                <div className="flex justify-between items-start">
                  <span className="stat-card-title">Expense</span>
                  <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <ArrowDownRight size={18} />
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="stat-card-value">₹ 5,788.21</span>
                </div>
                <div className="trend-badge trend-badge-negative mt-2">
                  <ArrowDownRight size={12} className="mr-1" /> 12.5%
                </div>
              </CardContent>
            </Card>

            {/* Today's Dispatch Card */}
            <Card>
              <CardContent className="stat-card">
                <div className="flex justify-between items-start">
                  <span className="stat-card-title">Today's Dispatch</span>
                  <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Package size={18} />
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="stat-card-value">
                    {kpiData?.todaysDispatch || 0}
                  </span>
                </div>
                <div className="trend-badge trend-badge-positive mt-2">
                  <ArrowUpRight size={12} className="mr-1" /> 8.3%
                </div>
              </CardContent>
            </Card>

            {/* Pending Purchases Card */}
            <Card>
              <CardContent className="stat-card">
                <div className="flex justify-between items-start">
                  <span className="stat-card-title">Pending Purchases</span>
                  <span className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <AlertCircle size={18} />
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="stat-card-value">
                    {kpiData?.pendingPurchases || 0}
                  </span>
                </div>
                <div className="trend-badge trend-badge-negative mt-2">
                  <ArrowDownRight size={12} className="mr-1" /> 3.2%
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle className="text-base font-medium">Cash Flow</CardTitle>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="tab-pills">
                <button className="tab-pill tab-pill-active">Weekly</button>
                <button className="tab-pill tab-pill-inactive">Daily</button>
              </div>
              <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-6">
            {loading ? (
              <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cashFlowData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIncome"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorExpense"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500 font-medium">
                Business account
              </h3>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              ₹ 8,672.20
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpRight size={10} className="mr-0.5" />
                10.0%
              </span>
              <span className="mx-1">vs.</span>
              <span>₹7,921.14 last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500 font-medium">
                Total Saving
              </h3>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              ₹ 3,765.35
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="text-red-600 font-medium flex items-center">
                <ArrowDownRight size={10} className="mr-0.5" />
                3.5%
              </span>
              <span className="mx-1">vs.</span>
              <span>₹3,116.50 last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500 font-medium">Tax Reserve</h3>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              ₹ 14,376.16
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpRight size={10} className="mr-0.5" />
                32.5%
              </span>
              <span className="mx-1">vs.</span>
              <span>₹10,850.86 last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Transactions Table */}
      <div className="mb-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center border-b px-6">
            <div>
              <CardTitle className="text-base font-medium">
                Recent Activity
              </CardTitle>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1.5">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1.5">
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </CardHeader>

          <div className="px-6 py-2 flex border-b border-gray-100">
            <div className="tab-pills">
              <button
                onClick={() => setActiveView("purchase")}
                className={`tab-pill ${
                  activeView === "purchase"
                    ? "tab-pill-active"
                    : "tab-pill-inactive"
                }`}
              >
                Purchases
              </button>
              <button
                onClick={() => setActiveView("sale")}
                className={`tab-pill ${
                  activeView === "sale"
                    ? "tab-pill-active"
                    : "tab-pill-inactive"
                }`}
              >
                Sales
              </button>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {(activeView === "purchase"
                      ? purchaseColumns
                      : saleColumns
                    ).map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          [
                            "pickupQty",
                            "buyRate",
                            "buyAmount",
                            "dropQty",
                            "sellRate",
                            "sellAmount",
                            "difference",
                            "amountInclusiveGST",
                          ].includes(column.key)
                            ? "text-right"
                            : ""
                        } ${column.key === "index" ? "w-12" : ""}`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td
                            colSpan={activeView === "purchase" ? 9 : 11}
                            className="p-4"
                          >
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                  ) : transportData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeView === "purchase" ? 9 : 11}
                        className="text-center py-10 text-gray-500"
                      >
                        No transaction records found
                      </td>
                    </tr>
                  ) : (
                    transportData.slice(0, 5).map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {activeView === "purchase" ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.challanNo || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.vehicleNo || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.material || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.purchasedFrom || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.pickupDate || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.pickupQty === "number"
                                ? transaction.pickupQty.toFixed(3)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.buyRate === "number"
                                ? transaction.buyRate.toFixed(2)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.buyAmount === "number"
                                ? transaction.buyAmount.toFixed(2)
                                : "-"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.challanNo || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.vehicleNo || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.material || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.soldTo || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.dropDate || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.dropQty === "number"
                                ? transaction.dropQty.toFixed(3)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.sellRate === "number"
                                ? transaction.sellRate.toFixed(2)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.sellAmount === "number"
                                ? transaction.sellAmount.toFixed(2)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right bg-amber-50/30">
                              {typeof transaction.difference === "number"
                                ? transaction.difference.toFixed(2)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {typeof transaction.amountInclusiveGST ===
                              "number"
                                ? transaction.amountInclusiveGST.toFixed(2)
                                : "-"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && transportData.length > 5 && (
              <div className="py-3 px-6 flex justify-between items-center border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing 5 of {transportData.length} records
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
                    <ArrowLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-50 text-teal-600 text-sm font-medium">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 text-sm">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 text-sm">
                      3
                    </button>
                  </div>
                  <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
