"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import TableWrapper from "@/components/TableWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Truck } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import MachineList from "./components/MachineList";
import DispatchList from "./components/DispatchList";
import SiteList from "./components/SiteList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabType = "sites" | "machines" | "dispatches";

export default function CrusherPage() {
  const [activeTab, setActiveTab] = useState<TabType>("sites");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppShell pageTitle="Crusher Management">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <Tabs
          defaultValue="sites"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-gray-100">
              <TabsTrigger
                value="sites"
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Plus size={16} />
                Sites
              </TabsTrigger>
              <TabsTrigger 
                value="machines" 
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Settings size={16} />
                Machines
              </TabsTrigger>
              <TabsTrigger
                value="dispatches"
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Truck size={16} />
                Dispatches
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sites">
            <SiteList />
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
