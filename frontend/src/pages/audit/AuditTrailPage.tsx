import React, { useState } from 'react';
import { useMyAuditTrails } from '@/hooks/useAudit';
import { AuditTrailList } from '@/components/shared/AuditTrailList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Filter, Search, X, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { AuditFilters } from '@/apis/audit';

export const AuditTrailPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [localSearch, setLocalSearch] = useState('');
  const [localFilters, setLocalFilters] = useState<AuditFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Build API filters including pagination
  const apiFilters = {
    ...appliedFilters,
    search: localSearch,
    page: currentPage,
    limit: pageSize,
  };

  const { data: myAuditTrails, isLoading } = useMyAuditTrails(apiFilters);

  const handleSearch = () => {
    // Search is handled by the API call above
  };

  const handleFilterChange = (newFilters: Partial<AuditFilters>) => {
    setLocalFilters({ ...localFilters, ...newFilters });
  };

  const handleApplyFilters = () => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setAppliedFilters(localFilters);
    setIsDialogOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
    setLocalSearch('');
    setCurrentPage(1);
    setIsDialogOpen(false);
  };

  const handleNextPage = () => {
    if (myAuditTrails && currentPage < Math.ceil(myAuditTrails.total / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localSearch) count++;
    if (appliedFilters.action) count++;
    if (appliedFilters.dateRange?.from || appliedFilters.dateRange?.to) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const auditActions = [
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'USER_REGISTERED', label: 'User Registered' },
    { value: 'RFP_CREATED', label: 'RFP Created' },
    { value: 'RFP_UPDATED', label: 'RFP Updated' },
    { value: 'RFP_PUBLISHED', label: 'RFP Published' },
    { value: 'RESPONSE_SUBMITTED', label: 'Response Submitted' },
    { value: 'RESPONSE_APPROVED', label: 'Response Approved' },
    { value: 'RESPONSE_REJECTED', label: 'Response Rejected' },
    { value: 'DOCUMENT_UPLOADED', label: 'Document Uploaded' },
    { value: 'DOCUMENT_DELETED', label: 'Document Deleted' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Activity History</h1>
            <p className="text-muted-foreground">
              Track your system activity and view detailed audit logs of all your actions.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className={`h-4 w-4 ${activeFilterCount > 0 ? 'text-primary' : ''}`} />
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {activeFilterCount} active
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search in details..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Action Type Select */}
              <div className="space-y-2 w-full">
                <Label htmlFor="action">Action Type</Label>
                <Select 
                  value={localFilters.action || 'all'} 
                  onValueChange={(value) => handleFilterChange({ action: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger id="action" className="w-full">
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
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange?.from ? (
                        localFilters.dateRange.to ? (
                          <>
                            {format(localFilters.dateRange.from, 'LLL dd, y')} - {format(localFilters.dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(localFilters.dateRange.from, 'LLL dd, y')
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
                      defaultMonth={localFilters.dateRange?.from}
                      selected={localFilters.dateRange}
                      onSelect={(range) => handleFilterChange({ dateRange: range })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
                <Button onClick={handleApplyFilters} className="flex-1">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Audit Trail List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-left">
            <Activity className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-left">
            Your recent system activity and audit trail entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditTrailList 
            auditTrails={myAuditTrails?.data || []} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {myAuditTrails && myAuditTrails.total > pageSize && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, myAuditTrails.total)} of {myAuditTrails.total} entries
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
                {currentPage} / {Math.ceil(myAuditTrails.total / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= Math.ceil(myAuditTrails.total / pageSize)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


