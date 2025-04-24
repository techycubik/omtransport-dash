'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import AppShell from '@/components/AppShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch KPI data
        const kpiResponse = await api('/api/reports/kpis');
        if (!kpiResponse.ok) {
          const errorData = await kpiResponse.json().catch(() => ({}));
          console.error('KPI error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch KPI data');
        }
        const kpiResult = await kpiResponse.json();
        setKpiData(kpiResult);

        // Fetch weekly data
        const weeklyResponse = await api('/api/reports/weekly');
        if (!weeklyResponse.ok) {
          const errorData = await weeklyResponse.json().catch(() => ({}));
          console.error('Weekly data error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch weekly data');
        }
        const weeklyResult = await weeklyResponse.json();
        setWeeklyData(weeklyResult);
        
        // Fetch transport data
        const transportResponse = await api('/api/reports/transactions');
        if (!transportResponse.ok) {
          const errorData = await transportResponse.json().catch(() => ({}));
          console.error('Transaction error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch transaction data');
        }
        const transportResult = await transportResponse.json();
        setTransportData(transportResult);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data. Please try again later.");
        
        // Only use mock data in development if there was an error
        if (process.env.NODE_ENV === 'development') {
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
      topMaterial: 'Gravel'
    });
    
    setWeeklyData([
      { day: 'Mon', sold: 20, purchased: 18 },
      { day: 'Tue', sold: 15, purchased: 12 },
      { day: 'Wed', sold: 25, purchased: 22 },
      { day: 'Thu', sold: 22, purchased: 20 },
      { day: 'Fri', sold: 30, purchased: 28 },
      { day: 'Sat', sold: 18, purchased: 15 },
      { day: 'Sun', sold: 10, purchased: 8 }
    ]);
    
    // Mock transport data
    setTransportData([
      {
        id: 1,
        challanNo: '1326',
        vehicleNo: 'KA.05.AN.9144',
        material: 'M.SAND',
        purchasedFrom: 'AMB TRADERS',
        pickupDate: '16-08-2023',
        pickupQty: 35.203,
        buyRate: 609.52,
        buyAmount: 21517,
        soldTo: 'NUVOCO ANJANAPURA',
        dropDate: '16-08-2023',
        dropQty: 35.735,
        sellRate: 670,
        sellAmount: 23942,
        difference: 2425.47,
        amountInclusiveGST: 26253
      },
      {
        id: 2,
        challanNo: '1327',
        vehicleNo: 'KA.05.AN.9036',
        material: 'M.SAND',
        purchasedFrom: 'AMB TRADERS',
        pickupDate: '22-08-2023',
        pickupQty: 35.856,
        buyRate: 609.52,
        buyAmount: 21733,
        soldTo: 'NUVOCO ANJANAPURA',
        dropDate: '22-08-2023',
        dropQty: 36.656,
        sellRate: 670,
        sellAmount: 23890,
        difference: 2156.47,
        amountInclusiveGST: 25984
      },
      {
        id: 3,
        challanNo: '1328',
        vehicleNo: 'KA.05.AN.9144',
        material: 'M.SAND',
        purchasedFrom: 'AMB TRADERS',
        pickupDate: '23-08-2023',
        pickupQty: 37.413,
        buyRate: 609.52,
        buyAmount: 22860,
        soldTo: 'NUVOCO ANJANAPURA',
        dropDate: '23-08-2023',
        dropQty: 37.413,
        sellRate: 670,
        sellAmount: 25067,
        difference: 2282.74,
        amountInclusiveGST: 27573
      }
    ]);
  };

  // KPI Card Components
  const KpiSkeleton = () => (
    <div className="col-span-1 h-32">
      <div className="h-full rounded-lg bg-white shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  const KpiCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-slate-100 p-1.5 text-slate-700">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell pageTitle="Dashboard">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-slate-600 text-sm md:text-base">
          {user ? `Logged in as ${user.email}` : 'Loading user information...'}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard 
              title="Today's Dispatch" 
              value={kpiData?.todaysDispatch || 0} 
              icon={<span className="text-xl">📦</span>} 
            />
            <KpiCard 
              title="Pending Purchases" 
              value={kpiData?.pendingPurchases || 0} 
              icon={<span className="text-xl">🔄</span>} 
            />
            <KpiCard 
              title="Variance %" 
              value={`${kpiData?.variancePct || 0}%`} 
              icon={<span className="text-xl">📊</span>} 
            />
            <KpiCard 
              title="Top Material" 
              value={kpiData?.topMaterial || '-'} 
              icon={<span className="text-xl">🏆</span>} 
            />
          </>
        )}
      </div>

      {/* Chart Section */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Weekly Overview</h3>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            {loading ? (
              <div className="h-48 md:h-64 w-full bg-slate-100 animate-pulse rounded-md"></div>
            ) : (
              <div className="w-full overflow-x-auto" style={{ minHeight: "250px" }}>
                <ResponsiveContainer width="100%" height={300} minWidth={500}>
                  <BarChart data={weeklyData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sold" fill="#3b82f6" name="Sold" />
                    <Bar dataKey="purchased" fill="#10b981" name="Purchased" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Table */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Transaction Records</h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap">SR. NO.</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">CHALLAN NO</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">VEHICLE NO.</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">MATERIAL</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">PURCHASED FROM</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">DATE</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">QTY</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">RATE</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">AMOUNT</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">SOLD TO</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">DATE</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">QTY</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">RATE</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">AMOUNT</TableHead>
                    <TableHead className="text-xs bg-yellow-100 whitespace-nowrap">DIFF</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">AMOUNT INCLUSIVE GST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-4">Loading transaction data...</TableCell>
                    </TableRow>
                  ) : transportData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-4">No transaction records found</TableCell>
                    </TableRow>
                  ) : (
                    transportData.map((transaction, index) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-xs whitespace-nowrap">{index + 1}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.challanNo || '-'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.vehicleNo || '-'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.material || '-'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.purchasedFrom || '-'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.pickupDate || '-'}</TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.pickupQty === 'number' ? transaction.pickupQty.toFixed(3) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.buyRate === 'number' ? transaction.buyRate.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.buyAmount === 'number' ? transaction.buyAmount.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.soldTo || '-'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{transaction.dropDate || '-'}</TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.dropQty === 'number' ? transaction.dropQty.toFixed(3) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.sellRate === 'number' ? transaction.sellRate.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.sellAmount === 'number' ? transaction.sellAmount.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right bg-yellow-50 font-medium whitespace-nowrap">
                          {typeof transaction.difference === 'number' ? transaction.difference.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {typeof transaction.amountInclusiveGST === 'number' ? transaction.amountInclusiveGST.toFixed(2) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
} 