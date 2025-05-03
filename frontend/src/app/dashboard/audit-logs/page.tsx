'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, X, Filter } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Define types
type AuditLog = {
  id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: number;
  userId: number;
  userName: string;
  userEmail: string;
  details: string;
  createdAt: string;
};

export default function AuditLogsPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  // Mock data for development
  const mockLogs: AuditLog[] = [
    {
      id: 1,
      action: 'CREATE',
      entityType: 'User',
      entityId: 5,
      userId: 1,
      userName: 'Super Admin',
      userEmail: 'admin@omtransport.com',
      details: 'Created user: staff2@example.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      action: 'UPDATE',
      entityType: 'User',
      entityId: 3,
      userId: 1,
      userName: 'Super Admin',
      userEmail: 'admin@omtransport.com',
      details: 'Updated user role: STAFF → ADMIN',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 3,
      action: 'DELETE',
      entityType: 'User',
      entityId: 4,
      userId: 1,
      userName: 'Super Admin',
      userEmail: 'admin@omtransport.com',
      details: 'Deleted user: inactive@example.com',
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    },
    {
      id: 4,
      action: 'CREATE',
      entityType: 'Vehicle',
      entityId: 12,
      userId: 2,
      userName: 'Test Admin',
      userEmail: 'admin@example.com',
      details: 'Created vehicle: TN-01-AB-1234',
      createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
    {
      id: 5,
      action: 'UPDATE',
      entityType: 'Trip',
      entityId: 28,
      userId: 3,
      userName: 'Test User',
      userEmail: 'test@test.com',
      details: 'Updated trip status: PLANNED → IN_PROGRESS',
      createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    },
  ];

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/dashboard');
      toast.error('Admin access required');
    }
  }, [isAdmin, router]);

  // Fetch logs on component mount and when filters change
  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, entityFilter]);

  // Function to fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from API with filters
      // const response = await api(`/audit-logs?page=${currentPage}&action=${actionFilter}&entityType=${entityFilter}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch audit logs');
      // }
      // const data = await response.json();
      // setLogs(data.logs);
      // setTotalPages(data.totalPages);

      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredLogs = [...mockLogs];
      
      if (actionFilter && actionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
      }
      
      if (entityFilter && entityFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.entityType === entityFilter);
      }
      
      setLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Function to search logs
  const searchLogs = async () => {
    if (!searchQuery.trim()) {
      return fetchLogs();
    }
    
    setIsSearching(true);
    try {
      // In a real app, you would search with API
      // const response = await api(`/audit-logs/search?query=${encodeURIComponent(searchQuery)}`);
      // if (!response.ok) {
      //   throw new Error('Failed to search audit logs');
      // }
      // const data = await response.json();
      // setLogs(data.logs);
      // setTotalPages(data.totalPages);

      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredLogs = mockLogs.filter(log => 
        log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
    } catch (error) {
      console.error('Error searching audit logs:', error);
      toast.error('Failed to search audit logs');
    } finally {
      setIsSearching(false);
    }
  };

  // Get action color based on type
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get entity color based on type
  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'User':
        return 'bg-purple-100 text-purple-800';
      case 'Vehicle':
        return 'bg-orange-100 text-orange-800';
      case 'Trip':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppShell pageTitle="Audit Logs">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-gray-600 mt-2">
          Track all changes made to the database by users
        </p>
      </div>

      <Card className="p-6 bg-white mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by user, email or action details"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLogs()}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Trip">Trip</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={searchLogs}
              disabled={isSearching}
              className="flex items-center gap-2"
            >
              <Search size={16} />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  fetchLogs();
                }}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Clear
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-t-4 border-teal-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading audit logs...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-sm text-gray-500">{log.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getActionColor(log.action)}
                          `}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getEntityColor(log.entityType)}
                          `}>
                            {log.entityType} #{log.entityId}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-md">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>
    </AppShell>
  );
} 