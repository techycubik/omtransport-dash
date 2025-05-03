'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types
type Permission = {
  id: string;
  name: string;
  description: string;
  module: string;
};

type Role = {
  id: string;
  name: string;
  description?: string;
};

type RoleWithPermissions = Role & {
  permissions: string[];
};

// Map to actual permissions from database
const availablePermissions: Permission[] = [
  // Users module
  { id: 'users.view', name: 'View Users', description: 'Can view all users', module: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new users', module: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can edit existing users', module: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can delete users', module: 'Users' },
  
  // Vehicles module
  { id: 'vehicles.view', name: 'View Vehicles', description: 'Can view all vehicles', module: 'Vehicles' },
  { id: 'vehicles.create', name: 'Create Vehicles', description: 'Can create new vehicles', module: 'Vehicles' },
  { id: 'vehicles.edit', name: 'Edit Vehicles', description: 'Can edit existing vehicles', module: 'Vehicles' },
  { id: 'vehicles.delete', name: 'Delete Vehicles', description: 'Can delete vehicles', module: 'Vehicles' },
  
  // Trips module
  { id: 'trips.view', name: 'View Trips', description: 'Can view all trips', module: 'Trips' },
  { id: 'trips.create', name: 'Create Trips', description: 'Can create new trips', module: 'Trips' },
  { id: 'trips.edit', name: 'Edit Trips', description: 'Can edit existing trips', module: 'Trips' },
  { id: 'trips.delete', name: 'Delete Trips', description: 'Can delete trips', module: 'Trips' },
  
  // Reports module
  { id: 'reports.view', name: 'View Reports', description: 'Can view all reports', module: 'Reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports', module: 'Reports' },
];

// Simple checkbox component
const Checkbox = ({ 
  checked, 
  onCheckedChange, 
  disabled, 
  id 
}: { 
  checked?: boolean; 
  onCheckedChange?: (checked: boolean) => void; 
  disabled?: boolean; 
  id?: string;
}) => {
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`h-4 w-4 shrink-0 rounded-sm border peer-focus-visible:outline-none peer-focus-visible:ring-2 
          peer-focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${checked 
            ? 'bg-teal-500 border-teal-500 flex items-center justify-center' 
            : 'bg-white border-gray-300'} 
          ${disabled ? 'opacity-50' : ''}`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
    </div>
  );
};

export default function RolesManagementPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [activeRole, setActiveRole] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Redirecting non-super-admin users
  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error('You do not have permission to access this page');
      router.push('/dashboard');
    }
  }, [isSuperAdmin, router]);
  
  // Fetch roles (using mock data only)
  useEffect(() => {
    const loadRoles = async () => {
      setIsLoading(true);
      try {
        // Use static mock data until backend API is implemented
        const mockRoles = [
          {
            id: 'SUPER_ADMIN',
            name: 'Super Admin',
            description: 'Full access to all system features',
            permissions: availablePermissions.map(p => p.id),
          },
          {
            id: 'ADMIN',
            name: 'Admin',
            description: 'Administrative access with some restrictions',
            permissions: [
              'users.view', 'users.create', 'users.edit',
              'vehicles.view', 'vehicles.create', 'vehicles.edit', 'vehicles.delete',
              'trips.view', 'trips.create', 'trips.edit', 'trips.delete',
              'reports.view', 'reports.export',
            ],
          },
          {
            id: 'STAFF',
            name: 'Staff',
            description: 'Limited access for day-to-day operations',
            permissions: [
              'vehicles.view',
              'trips.view', 'trips.create', 'trips.edit',
              'reports.view',
            ],
          },
        ];
        
        // Add a small delay to simulate API fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setRoles(mockRoles);
        if (mockRoles.length > 0) {
          setActiveRole(mockRoles[0].id);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoles();
  }, []);
  
  const handlePermissionToggle = (permissionId: string) => {
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === activeRole) {
          const hasPermission = role.permissions.includes(permissionId);
          const newPermissions = hasPermission
            ? role.permissions.filter(id => id !== permissionId)
            : [...role.permissions, permissionId];
          
          return { ...role, permissions: newPermissions };
        }
        return role;
      })
    );
    setHasChanges(true);
  };
  
  const saveRolePermissions = async () => {
    setIsSaving(true);
    try {
      const roleToUpdate = roles.find(role => role.id === activeRole);
      if (!roleToUpdate) {
        throw new Error('Role not found');
      }
      
      // Simulating an API call since backend isn't ready
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update roles locally
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === roleToUpdate.id ? roleToUpdate : role
        )
      );
      
      toast.success('Role permissions saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save role permissions');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Group permissions by module
  const getPermissionsByModule = () => {
    const modules: Record<string, Permission[]> = {};
    
    availablePermissions.forEach(permission => {
      if (!modules[permission.module]) {
        modules[permission.module] = [];
      }
      modules[permission.module].push(permission);
    });
    
    return modules;
  };
  
  // Get the active role
  const currentRole = roles.find(role => role.id === activeRole);
  const permissionsByModule = getPermissionsByModule();
  
  if (!isSuperAdmin) {
    return null; // Prevent rendering if not a super admin
  }
  
  if (isLoading) {
    return (
      <AppShell pageTitle="Role Management">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-t-4 border-teal-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading role data...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell pageTitle="Role Management">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Role Management</h1>
        </div>
        {hasChanges && (
          <Button 
            onClick={saveRolePermissions} 
            disabled={isSaving}
            className="flex items-center"
          >
            {isSaving ? 'Saving...' : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>
      
      {roles.length === 0 ? (
        <Card className="p-6 bg-white text-center">
          <p className="text-gray-600">No roles found</p>
        </Card>
      ) : (
        <Card className="p-6 bg-white mb-6">
          <Tabs value={activeRole} onValueChange={setActiveRole}>
            <TabsList className="mb-6">
              {roles.map(role => (
                <TabsTrigger key={role.id} value={role.id}>
                  {role.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {roles.map(role => (
              <TabsContent key={role.id} value={role.id} className="space-y-6">
                {role.description && (
                  <p className="text-gray-600 mb-4">{role.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(permissionsByModule).map(([module, permissions]) => (
                    <div key={module} className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">{module}</h3>
                      <div className="space-y-3">
                        {permissions.map(permission => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <Checkbox 
                              id={`${role.id}-${permission.id}`}
                              checked={currentRole?.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              disabled={role.id === 'SUPER_ADMIN'} // Super Admin always has all permissions
                            />
                            <div className="grid gap-1.5">
                              <label
                                htmlFor={`${role.id}-${permission.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.name}
                              </label>
                              <p className="text-xs text-gray-500">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {role.id === 'SUPER_ADMIN' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">
                      The Super Admin role always has all permissions and cannot be modified.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}
    </AppShell>
  );
} 