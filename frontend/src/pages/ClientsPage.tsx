import { Box, Typography, Button } from '@mui/material';
import { useClients } from '../hooks/useClients';
import ClientsFilters from './Clients/components/ClientsFilters';
import ClientsTable from './Clients/components/ClientsTable';
import ClientHistoryDrawer from './Clients/components/ClientHistoryDrawer';

export default function ClientsPage() {
  const {
    clients,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    sourceFilter,
    setSourceFilter,
    selectedClient,
    setSelectedClient,
    clearFilters,
  } = useClients();

  const handleExportCSV = () => {
    // Generate CSV data from clients list
    const headers = 'ID,Name,Phone,Email,Client Type,Booking Source,Bookings,Created At\n';
    const rows = clients.map(c => 
      `"${c.id}","${c.name}","${c.phone_number}","${c.email || ''}","${c.client_type}","${c.booking_source}",${c.total_bookings || 0},"${c.created_at}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `glowassist_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ flex1: 1, overflowY: 'auto', p: 4, bgcolor: '#FAF8F5' }}>
      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '2rem', 
              fontWeight: 600, 
              color: '#2A1F1A',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            Client Database
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {clients.length} clients
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleExportCSV}
          sx={{ 
            borderRadius: 2, 
            fontSize: '0.78rem',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(201, 132, 122, 0.04)',
            }
          }}
        >
          Export CSV
        </Button>
      </Box>

      {/* ── Search & Filters ── */}
      <ClientsFilters
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        clearFilters={clearFilters}
      />

      {/* ── Table Grid ── */}
      <ClientsTable
        clients={clients}
        loading={loading}
        onSelectClient={setSelectedClient}
      />

      {/* ── History Drawer Slide-in ── */}
      <ClientHistoryDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </Box>
  );
}
