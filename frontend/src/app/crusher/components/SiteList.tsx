"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Pencil, Trash2, Search } from "lucide-react";
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
];

export default function SiteList() {
  const [sites, setSites] = useState<CrusherSite[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch materials
        const materialsRes = await api("/api/materials");
        if (!materialsRes.ok) throw new Error("Failed to fetch materials");
        const materialsData = await materialsRes.json();
        setMaterials(materialsData);

        // Fetch crusher sites
        const sitesRes = await api("/api/crusher/sites");
        if (!sitesRes.ok) throw new Error("Failed to fetch crusher sites");
        const sitesData = await sitesRes.json();
        setSites(sitesData);
      } catch (error) {
        toast.error("Error loading data");
        console.error(error);
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
      setIsAddDialogOpen(false);
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Crusher Sites</h2>
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
          </div>
          <Button 
            className="flex items-center gap-2" 
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus size={16} />
            Add New Site
          </Button>
        </div>
        
        <TableWrapper
          loading={loading}
          isEmpty={filteredSites.length === 0}
          emptyMessage="No crusher sites found. Add your first site!"
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleEdit(site)}
                      >
                        <Pencil size={14} />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(site)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </Card>

      {/* Add Site Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Crusher Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Site Name
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
                Owner Name
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
                Location
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
          </div>
          <DialogFooter>
            <Button type="button" onClick={onSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <DialogFooter>
            <Button type="button" onClick={onUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the crusher site "{selectedSite?.name}"? 
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 