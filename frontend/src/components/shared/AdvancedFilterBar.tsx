'use client';

import React, { useState } from 'react';
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
  dateRange?: DateRange;
  budgetMin?: number;
  budgetMax?: number;
}

interface AdvancedFilterBarProps {
  onFilterChange: (filters: Filters) => void;
  statuses: { value: string; label: string }[];
  initialFilters?: Filters;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  onFilterChange,
  statuses,
  initialFilters = {},
}) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialFilters.dateRange);
  const [budget, setBudget] = useState([initialFilters.budgetMin || 0, initialFilters.budgetMax || 100000]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      dateRange,
      budgetMin: budget[0],
      budgetMax: budget[1],
    });
    setIsDialogOpen(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setDateRange(undefined);
    setBudget([0, 100000]);
    onFilterChange({});
    setIsDialogOpen(false);
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (status !== 'all') count++;
    if (dateRange?.from || dateRange?.to) count++;
    if (budget[0] > 0 || budget[1] < 100000) count++;
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
                placeholder="Search by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Select */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
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
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
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
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Budget Range */}
            <div className="space-y-2 pt-2">
              <Label>Budget Range: ${budget[0].toLocaleString()} - ${budget[1].toLocaleString()}</Label>
              <Slider
                value={budget}
                onValueChange={setBudget}
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
