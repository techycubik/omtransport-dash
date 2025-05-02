"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import TableWrapper from "@/components/TableWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Settings, Truck, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import ProductionList from "./components/ProductionList";
import MachineList from "./components/MachineList";
import DispatchList from "./components/DispatchList";
import SiteList from "./components/SiteList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabType = "machines" | "dispatches" | "sites";

export default function CrusherPage() {
  const [activeTab, setActiveTab] = useState<TabType>("machines");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppShell pageTitle="Crusher Management">
      <div className="space-y-6">
        <Tabs
          defaultValue="machines"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
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
              <TabsTrigger
                value="sites"
                className="flex items-center gap-2"
              >
                <MapPin size={16} />
                Sites
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="machines">
            <MachineList />
          </TabsContent>

          <TabsContent value="dispatches">
            <DispatchList />
          </TabsContent>

          <TabsContent value="sites">
            <SiteList />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
