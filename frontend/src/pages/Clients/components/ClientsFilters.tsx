import { Box, TextField, Select, MenuItem, FormControl, Button, InputAdornment } from '@mui/material';

interface ClientsFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  sourceFilter: string;
  setSourceFilter: (s: string) => void;
  clearFilters: () => void;
}

export function ClientsFilters({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  sourceFilter,
  setSourceFilter,
  clearFilters,
}: ClientsFiltersProps) {
  const showClear = search || typeFilter !== 'all' || sourceFilter !== 'all';

  return (
    <Box 
      display="flex" 
      flexWrap="wrap" 
      alignItems="center" 
      gap={2} 
      sx={{ mb: 4 }}
    >
      {/* Search Bar */}
      <TextField
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="outlined"
        size="small"
        sx={{
          flexGrow: 1,
          maxWidth: 360,
          bgcolor: 'background.paper',
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.main' },
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <span style={{ fontSize: '0.9rem' }}>🔍</span>
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <Button 
                onClick={() => setSearch('')} 
                sx={{ 
                  p: 0, 
                  minWidth: 0, 
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                ✕
              </Button>
            </InputAdornment>
          )
        }}
      />

      {/* Client Type Selector */}
      <FormControl size="small" sx={{ minWidth: 160, bgcolor: 'background.paper' }}>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as string)}
          displayEmpty
          sx={{
            borderRadius: 3,
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.main' },
          }}
        >
          <MenuItem value="all">All Client Types</MenuItem>
          <MenuItem value="vip">♛ VIP</MenuItem>
          <MenuItem value="regular">⭐ Regular</MenuItem>
          <MenuItem value="first_time">✨ First Time</MenuItem>
        </Select>
      </FormControl>

      {/* Booking Source Selector */}
      <FormControl size="small" sx={{ minWidth: 160, bgcolor: 'background.paper' }}>
        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as string)}
          displayEmpty
          sx={{
            borderRadius: 3,
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.main' },
          }}
        >
          <MenuItem value="all">All Sources</MenuItem>
          <MenuItem value="whatsapp_ai">✦ WhatsApp AI</MenuItem>
          <MenuItem value="live_chat">💬 Live Chat</MenuItem>
          <MenuItem value="manual_crm">👤 Manual CRM</MenuItem>
          <MenuItem value="walk_in">🚶 Walk-in</MenuItem>
        </Select>
      </FormControl>

      {/* Clear Filters button */}
      {showClear && (
        <Button
          onClick={clearFilters}
          variant="outlined"
          color="primary"
          sx={{
            borderRadius: 3,
            fontSize: '0.78rem',
            px: 2.5,
            height: 38,
            borderColor: 'rgba(201, 132, 122, 0.3)',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(201, 132, 122, 0.05)'
            }
          }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );
}

export default ClientsFilters;
