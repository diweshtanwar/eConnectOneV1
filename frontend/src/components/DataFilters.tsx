import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Chip, Paper, Grid, Collapse } from '@mui/material';
import { FilterList, Clear, ExpandMore, ExpandLess, Search } from '@mui/icons-material';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { value: string | number; label: string }[];
}

export interface FilterValues {
  [key: string]: any;
}

interface DataFiltersProps {
  filters: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear: () => void;
  onSearch?: (values: FilterValues) => void; // Optional search callback for API calls
  searchMode?: boolean; // If true, shows search button instead of real-time filtering
}

export const DataFilters: React.FC<DataFiltersProps> = ({ filters, values, onChange, onClear, onSearch, searchMode = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [localValues, setLocalValues] = useState<FilterValues>(values);

  const handleChange = (key: string, value: any) => {
    const newValues = { ...localValues, [key]: value };
    setLocalValues(newValues);
    
    if (!searchMode) {
      // Real-time filtering for client-side data
      onChange(newValues);
    }
  };

  const handleSearch = () => {
    onChange(localValues);
    if (onSearch) {
      onSearch(localValues);
    }
  };

  const handleClear = () => {
    setLocalValues({});
    onChange({});
    onClear();
  };

  const getActiveFiltersCount = () => {
    const currentValues = searchMode ? localValues : values;
    return Object.values(currentValues).filter(v => v !== '' && v !== null && v !== undefined).length;
  };

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <TextField
            key={filter.key}
            select
            label={filter.label}
            value={localValues[filter.key] || ''}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {filter.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'date':
        return (
          <TextField
            key={filter.key}
            type="date"
            label={filter.label}
            value={localValues[filter.key] || ''}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'dateRange':
        return (
          <Box key={filter.key} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              type="date"
              label={`${filter.label} From`}
              value={localValues[`${filter.key}From`] || ''}
              onChange={(e) => handleChange(`${filter.key}From`, e.target.value)}
              size="small"
              sx={{ minWidth: 130 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label={`${filter.label} To`}
              value={localValues[`${filter.key}To`] || ''}
              onChange={(e) => handleChange(`${filter.key}To`, e.target.value)}
              size="small"
              sx={{ minWidth: 130 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );
      default:
        return (
          <TextField
            key={filter.key}
            label={filter.label}
            value={localValues[filter.key] || ''}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          />
        );
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Button
            variant="text"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          >
            Filters {getActiveFiltersCount() > 0 && <Chip label={getActiveFiltersCount()} size="small" sx={{ ml: 1 }} />}
          </Button>
        </Box>
        {getActiveFiltersCount() > 0 && (
          <Button startIcon={<Clear />} onClick={handleClear} size="small">
            Clear All
          </Button>
        )}
      </Box>
      
      <Collapse in={expanded}>
        <Grid container spacing={2} alignItems="center">
          {filters.map((filter) => (
            <Grid key={filter.key}>
              {renderFilter(filter)}
            </Grid>
          ))}
          {searchMode && (
            <Grid>
              <Button 
                variant="contained" 
                startIcon={<Search />} 
                onClick={handleSearch} 
                size="small"
              >
                Search
              </Button>
            </Grid>
          )}
        </Grid>
      </Collapse>
    </Paper>
  );
};