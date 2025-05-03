"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import TableWrapper from "@/components/TableWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as z from "zod";

// Types
interface CrusherSite {
  id: number;
  name: string;
  owner: string;
  location: string;
  Materials: Material[];
  createdAt: string;
  updatedAt: string;
}

interface Material {
  id: number;
  name: string;
  uom: string;
}

// Goa locations
const goaLocations = [
  "Panaji",
  "Margao",
  "Vasco da Gama",
  "Mapusa",
  "Ponda",
  "Bicholim",
  "Canacona",
  "Curchorem",
  "Quepem",
  "Sanguem",
  "Sanquelim",
  "Valpoi",
  "Pernem",
  "Cuncolim",
  "Mandrem",
  "Aldona",
  "Anjuna",
  "Calangute",
  "Candolim",
  "Colva",
  "Cortalim",
  "Betul",
  "Majorda",
  "Morjim",
  "Arambol",
  "Assagao",
  "Benaulim",
  "Cavelossim",
  "Chinchinim",
  "Saligao",
  "Reis Magos",
  "Sawantwadi Border",
  "Tiswadi",
  "Old Goa"
];

export default function SiteList() {
  const [sites, setSites] = useState<CrusherSite[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CrusherSite | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formOwner, setFormOwner] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formMaterials, setFormMaterials] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch sites and materials
  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      setLoading(true);
      try {
        // Fetch materials
        const materialsRes = await api("/api/materials");
        if (!materialsRes.ok) {
          const errorText = await materialsRes.text();
          throw new Error(`Failed to fetch materials: ${materialsRes.status} - ${errorText}`);
        }
        const materialsData = await materialsRes.json();
        setMaterials(materialsData);

        // Fetch crusher sites
        const sitesRes = await api("/api/crusher/sites");
        if (!sitesRes.ok) {
          const errorText = await sitesRes.text();
          throw new Error(`Failed to fetch crusher sites: ${sitesRes.status} - ${errorText}`);
        }
        const sitesData = await sitesRes.json();
        setSites(sitesData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error loading data";
        console.error("API Error:", error);
        
        // Retry up to 2 times with exponential backoff
        if (retryCount < 2) {
          const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s
          toast(`Connection issue. Retrying in ${retryDelay/1000}s...`);
          setTimeout(() => fetchData(retryCount + 1), retryDelay);
          return;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Validate form data
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formName || formName.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!formOwner || formOwner.length < 2) {
      errors.owner = "Owner name is required";
    }
    
    if (!formLocation) {
      errors.location = "Location is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormOwner("");
    setFormLocation("");
    setFormMaterials([]);
    setFormErrors({});
  };

  // Handle form submission for adding new site
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const data = {
        name: formName,
        owner: formOwner,
        location: formLocation,
        materials: formMaterials
      };
      
      const response = await api("/api/crusher/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create crusher site");
      }

      const newSite = await response.json();
      setSites([newSite, ...sites]);
      toast.success("Crusher site added successfully!");
      setIsAddMode(false);
      resetForm();
    } catch (error) {
      toast.error("Error creating crusher site");
      console.error(error);
    }
  };

  // Handle editing a site
  const handleEdit = (site: CrusherSite) => {
    setSelectedSite(site);
    setFormName(site.name);
    setFormOwner(site.owner);
    setFormLocation(site.location);
    setFormMaterials(site.Materials.map(m => m.id));
    setIsEditDialogOpen(true);
  };

  // Handle update form submission
  const onUpdate = async () => {
    if (!validateForm() || !selectedSite) return;
    
    try {
      const data = {
        name: formName,
        owner: formOwner,
        location: formLocation,
        materials: formMaterials
      };
      
      const response = await api(`/api/crusher/sites/${selectedSite.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update crusher site");
      }

      const updatedSite = await response.json();
      setSites(sites.map(site => site.id === updatedSite.id ? updatedSite : site));
      toast.success("Crusher site updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Error updating crusher site");
      console.error(error);
    }
  };

  // Handle deleting a site
  const handleDelete = (site: CrusherSite) => {
    setSelectedSite(site);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedSite) return;
    
    try {
      const response = await api(`/api/crusher/sites/${selectedSite.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete crusher site");
      }

      setSites(sites.filter(site => site.id !== selectedSite.id));
      toast.success("Crusher site deleted successfully!");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Error deleting crusher site");
      console.error(error);
    }
  };

  // Handle material checkbox change
  const handleMaterialChange = (materialId: number, checked: boolean) => {
    if (checked) {
      setFormMaterials([...formMaterials, materialId]);
    } else {
      setFormMaterials(formMaterials.filter(id => id !== materialId));
    }
  };

  // Filter sites based on search term
  const filteredSites = searchTerm
    ? sites.filter(
        (site) =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sites;

  if (isAddMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 hover:bg-transparent"
            onClick={() => setIsAddMode(false)}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Add New Crusher Site</h2>
        </div>
        
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Site Name <span className="text-red-500">*</span>
              </label>
              <Input 
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter site name" 
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="owner" className="text-sm font-medium">
                Owner Name <span className="text-red-500">*</span>
              </label>
              <Input 
                id="owner"
                value={formOwner}
                onChange={(e) => setFormOwner(e.target.value)}
                placeholder="Enter owner name" 
              />
              {formErrors.owner && (
                <p className="text-red-500 text-sm">{formErrors.owner}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select location</option>
                {goaLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {formErrors.location && (
                <p className="text-red-500 text-sm">{formErrors.location}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Materials</label>
              <div className="grid grid-cols-2 gap-2">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`material-${material.id}`}
                      checked={formMaterials.includes(material.id)}
                      onChange={(e) => handleMaterialChange(material.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`material-${material.id}`} className="text-sm">
                      {material.name} ({material.uom})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddMode(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onSubmit}
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      {/* Header section with search and add button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search sites..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Make the Add button more prominent */}
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-black hover:bg-primary/90"
          onClick={() => {
            resetForm();
            setIsAddMode(true);
          }}
        >
          <Plus size={16} />
          Add New Site
        </button>
      </div>
      
      <TableWrapper
        loading={loading}
        isEmpty={filteredSites.length === 0}
        emptyMessage="No crusher sites found. Add your first site!"
        searchTerm={searchTerm}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.name}</TableCell>
                <TableCell>{site.owner}</TableCell>
                <TableCell>{site.location}</TableCell>
                <TableCell>
                  {site.Materials.map(m => m.name).join(", ") || "None"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 text-gray-700 hover:bg-gray-50"
                      onClick={() => handleEdit(site)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 text-red-500 hover:bg-gray-50" 
                      onClick={() => handleDelete(site)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      {/* Edit Site Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Crusher Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Site Name
              </label>
              <Input 
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter site name" 
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-owner" className="text-sm font-medium">
                Owner Name
              </label>
              <Input 
                id="edit-owner"
                value={formOwner}
                onChange={(e) => setFormOwner(e.target.value)}
                placeholder="Enter owner name" 
              />
              {formErrors.owner && (
                <p className="text-red-500 text-sm">{formErrors.owner}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-location" className="text-sm font-medium">
                Location
              </label>
              <select
                id="edit-location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select location</option>
                {goaLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {formErrors.location && (
                <p className="text-red-500 text-sm">{formErrors.location}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Materials</label>
              <div className="grid grid-cols-2 gap-2">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-material-${material.id}`}
                      checked={formMaterials.includes(material.id)}
                      onChange={(e) => handleMaterialChange(material.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`edit-material-${material.id}`} className="text-sm">
                      {material.name} ({material.uom})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary/90"
              onClick={onUpdate}
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>
            This will permanently delete the crusher site "{selectedSite?.name}".
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