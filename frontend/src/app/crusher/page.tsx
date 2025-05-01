"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import TableWrapper from "@/components/TableWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Settings, Truck } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import ProductionList from "./components/ProductionList";
import MachineList from "./components/MachineList";
import DispatchList from "./components/DispatchList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabType = "production" | "machines" | "dispatches";

export default function CrusherPage() {
  const [activeTab, setActiveTab] = useState<TabType>("production");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppShell pageTitle="Crusher Management">
      <div className="space-y-6">
        <Tabs
          defaultValue="production"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger
                value="production"
                className="flex items-center gap-2"
              >
                <Activity size={16} />
                Production
              </TabsTrigger>
              <TabsTrigger value="machines" className="flex items-center gap-2">
                <Settings size={16} />
                Machines
              </TabsTrigger>
              <TabsTrigger
                value="dispatches"
                className="flex items-center gap-2"
              >
                <Truck size={16} />
                Dispatches
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="production">
            <ProductionList />
          </TabsContent>

          <TabsContent value="machines">
            <MachineList />
          </TabsContent>

          <TabsContent value="dispatches">
            <DispatchList />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
