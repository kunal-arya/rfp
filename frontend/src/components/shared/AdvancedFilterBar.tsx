'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      dateRange,
      budgetMin: budget[0],
      budgetMax: budget[1],
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setDateRange(undefined);
    setBudget([0, 100000]);
    onFilterChange({});
  };

  return (
    <div className="p-4 border rounded-lg bg-card space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Select */}
        <div>
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
        <div>
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
      </div>

      {/* Budget Slider */}
      <div className="space-y-2">
        <Label>Budget Range: ${budget[0].toLocaleString()} - ${budget[1].toLocaleString()}</Label>
        <Slider
          defaultValue={budget}
          onValueChange={setBudget}
          max={100000}
          step={1000}
          minStepsBetweenThumbs={1}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
        <Button onClick={handleApplyFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
