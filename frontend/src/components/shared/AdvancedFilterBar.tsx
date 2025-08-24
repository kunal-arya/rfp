'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export interface Filters {
  search?: string;
  status?: string;
  response_status?: string;
  dateRange?: DateRange;
  budgetMin?: number;
  budgetMax?: number;
  show_new_rfps?: boolean;
}

interface AdvancedFilterBarProps {
  onFilterChange: (filters: Filters) => void;
  statuses: { value: string; label: string }[];
  initialFilters?: Filters;
  filterType?: 'rfp' | 'response';
  page?: "BrowseRfpsPage" | "MyRfpsPage" | "MyResponsesPage";
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  onFilterChange,
  statuses,
  initialFilters = {},
  filterType = 'rfp',
  page = "MyRfpsPage",
}) => {
  // State for current applied filters
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  
  // State for dialog form (temporary state while dialog is open)
  const [dialogFilters, setDialogFilters] = useState<Filters>(initialFilters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Update dialog filters when applied filters change
  useEffect(() => {
    setDialogFilters(appliedFilters);
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    const newFilters = {
      search: dialogFilters.search || undefined,
      status: dialogFilters.status === 'all' ? undefined : dialogFilters.status,
      response_status: dialogFilters.response_status === 'all' ? undefined : dialogFilters.response_status,
      dateRange: dialogFilters.dateRange,
      budgetMin: dialogFilters.budgetMin,
      budgetMax: dialogFilters.budgetMax,
      show_new_rfps: dialogFilters.show_new_rfps,
    };

    setAppliedFilters(newFilters);
    onFilterChange(newFilters);
    setIsDialogOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setAppliedFilters(emptyFilters);
    setDialogFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    // Reset dialog filters to applied filters when dialog is closed without applying
    setDialogFilters(appliedFilters);
    setIsDialogOpen(false);
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.search) count++;
    if (appliedFilters.status && appliedFilters.status !== 'all') count++;
    if (appliedFilters.response_status && appliedFilters.response_status !== 'all') count++;
    if (appliedFilters.dateRange?.from || appliedFilters.dateRange?.to) count++;
    if (appliedFilters.budgetMin && appliedFilters.budgetMin > 0) count++;
    if (appliedFilters.budgetMax && appliedFilters.budgetMax < 100000) count++;
    if (appliedFilters.show_new_rfps) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="flex items-center gap-2">
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
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={handleDialogClose} onInteractOutside={handleDialogClose}>
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
                placeholder="Search by keyword..."
                value={dialogFilters.search || ''}
                onChange={(e) => setDialogFilters({ ...dialogFilters, search: e.target.value })}
              />
            </div>

            {/* Status Select */}
            <div className="space-y-2 w-full">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={dialogFilters.status || 'all'} 
                onValueChange={(value) => setDialogFilters({ ...dialogFilters, status: value })}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {statuses?.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show New RFPs Only (for Browse RFPs page) */}
            {page === "BrowseRfpsPage" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dialogFilters.show_new_rfps || false}
                    onChange={(e) => setDialogFilters({ ...dialogFilters, show_new_rfps: e.target.checked })}
                    className="rounded"
                  />
                  Show only RFPs I haven't applied to
                </Label>
              </div>
            )}

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
                    {dialogFilters.dateRange?.from ? (
                      dialogFilters.dateRange.to ? (
                        <>
                          {format(dialogFilters.dateRange.from, 'LLL dd, y')} - {format(dialogFilters.dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dialogFilters.dateRange.from, 'LLL dd, y')
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
                    defaultMonth={dialogFilters.dateRange?.from}
                    selected={dialogFilters.dateRange}
                    onSelect={(range) => setDialogFilters({ ...dialogFilters, dateRange: range })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Budget Range */}
            <div className="space-y-2 pt-2">
              <Label>Budget Range: ${(dialogFilters.budgetMin || 0).toLocaleString()} - ${(dialogFilters.budgetMax || 100000).toLocaleString()}</Label>
              <Slider
                value={[dialogFilters.budgetMin || 0, dialogFilters.budgetMax || 100000]}
                onValueChange={([min, max]) => setDialogFilters({ ...dialogFilters, budgetMin: min, budgetMax: max })}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$100,000</span>
              </div>
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
  );
};
