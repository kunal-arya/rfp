import React, { useState } from 'react';
import { useMyAuditTrails } from '@/hooks/useAudit';
import { AuditTrailList } from '@/components/shared/AuditTrailList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface AuditFilters {
  search?: string;
  action?: string;
  dateRange?: DateRange;
}

const AuditTrailPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [localSearch, setLocalSearch] = useState<string>('');

  // Build API filters including pagination
  const apiFilters = {
    search: filters.search,
    action: filters.action,
    page: currentPage,
    limit: pageSize,
  };

  // Query with pagination and filters
  const myAuditTrails = useMyAuditTrails(apiFilters);

  const handleFilterChange = (newFilters: AuditFilters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    const processedFilters: Record<string, string | undefined> = {
      search: newFilters.search,
      action: newFilters.action,
    };

    // Handle date range filters
    if (newFilters.dateRange?.from) {
      processedFilters['gte___created_at'] = format(newFilters.dateRange.from, 'yyyy-MM-dd');
    }
    if (newFilters.dateRange?.to) {
      processedFilters['lte___created_at'] = format(newFilters.dateRange.to, 'yyyy-MM-dd');
    }

    setFilters(processedFilters);
  };

  const handleSearch = () => {
    handleFilterChange({ ...filters, search: localSearch });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = myAuditTrails.data?.total 
    ? Math.ceil(myAuditTrails.data.total / pageSize) 
    : 0;

  const auditActions = [
    { value: 'RFP_CREATED', label: 'RFP Created' },
    { value: 'RFP_UPDATED', label: 'RFP Updated' },
    { value: 'RFP_PUBLISHED', label: 'RFP Published' },
    { value: 'RFP_STATUS_CHANGED', label: 'RFP Status Changed' },
    { value: 'RESPONSE_CREATED', label: 'Response Created' },
    { value: 'RESPONSE_SUBMITTED', label: 'Response Submitted' },
    { value: 'RESPONSE_APPROVED', label: 'Response Approved' },
    { value: 'RESPONSE_REJECTED', label: 'Response Rejected' },
    { value: 'RESPONSE_AWARDED', label: 'Response Awarded' },
    { value: 'DOCUMENT_UPLOADED', label: 'Document Uploaded' },
    { value: 'DOCUMENT_DELETED', label: 'Document Deleted' },
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'USER_REGISTERED', label: 'User Registered' },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center flex-col">
        <h1 className="text-3xl font-bold tracking-tight">My Activity</h1>
        <p className="text-muted-foreground">
          Track and monitor your system activity and actions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter your audit trail entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search in details..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={myAuditTrails.isLoading}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Type Select */}
              <div>
                <Label htmlFor="action">Action Type</Label>
                <Select 
                  value={filters.action || 'all'} 
                  onValueChange={(value) => handleFilterChange({ ...filters, action: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {auditActions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Popover */}
              <div>
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, 'LLL dd, y')} - {format(filters.dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(filters.dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={(range) => handleFilterChange({ ...filters, dateRange: range })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Your recent activity and actions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditTrailList
            auditTrails={myAuditTrails.data?.data || []}
            isLoading={myAuditTrails.isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, myAuditTrails.data?.total || 0)} of{' '}
                {myAuditTrails.data?.total || 0} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || myAuditTrails.isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={myAuditTrails.isLoading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      {currentPage > 3 && <span className="px-2">...</span>}
                      {currentPage > 3 && currentPage < totalPages - 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          disabled
                        >
                          {currentPage}
                        </Button>
                      )}
                      {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                      {currentPage < totalPages - 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={myAuditTrails.isLoading}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || myAuditTrails.isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {myAuditTrails.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Error loading audit trail: {myAuditTrails.error.message}</p>
              <Button
                variant="outline"
                onClick={() => myAuditTrails.refetch()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {myAuditTrails.data?.data && myAuditTrails.data.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="secondary">
                Total Entries: {myAuditTrails.data.total}
              </Badge>
              <Badge variant="secondary">
                Current Page: {currentPage} of {totalPages}
              </Badge>
              {myAuditTrails.data.data.length > 0 && (
                <Badge variant="secondary">
                  Date Range: {new Date(myAuditTrails.data.data[myAuditTrails.data.data.length - 1].created_at).toLocaleDateString()} - {new Date(myAuditTrails.data.data[0].created_at).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTrailPage;


