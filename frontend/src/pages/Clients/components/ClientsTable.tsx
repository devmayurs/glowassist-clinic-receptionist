import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Avatar, Box, Typography, Button, Chip, CircularProgress 
} from '@mui/material';
import type { ApiClient, ClientType, BookingSource } from '../../../types';

const CLIENT_TYPE_MAP: Record<ClientType, { bg: string; text: string; label: string }> = {
  vip: { bg: 'rgba(123, 79, 110, 0.1)', text: '#7B4F6E', label: '♛ VIP' },
  regular: { bg: 'rgba(184, 150, 90, 0.1)', text: '#B8965A', label: '⭐ Regular' },
  first_time: { bg: 'rgba(122, 158, 126, 0.1)', text: '#7A9E7E', label: '✨ First Time' },
};

const SOURCE_MAP: Record<BookingSource, { bg: string; text: string; label: string }> = {
  whatsapp_ai: { bg: 'rgba(201, 132, 122, 0.1)', text: '#C9847A', label: '✦ WhatsApp AI' },
  live_chat: { bg: 'rgba(122, 158, 126, 0.1)', text: '#7A9E7E', label: '💬 Live Chat' },
  manual_crm: { bg: '#FAF8F5', text: '#8A7268', label: '👤 Manual' },
  walk_in: { bg: 'rgba(184, 150, 90, 0.1)', text: '#B8965A', label: '🚶 Walk-in' },
};

const AVATAR_COLORS = [
  { bg: 'rgba(201, 132, 122, 0.1)', tc: '#C9847A' },
  { bg: 'rgba(123, 79, 110, 0.1)', tc: '#7B4F6E' },
  { bg: 'rgba(184, 150, 90, 0.1)', tc: '#B8965A' },
  { bg: 'rgba(122, 158, 126, 0.1)', tc: '#7A9E7E' },
];

function ClientTypeBadge({ type }: { type: ClientType }) {
  const current = CLIENT_TYPE_MAP[type] || { bg: '#FAF8F5', text: '#8A7268', label: type };
  return (
    <Chip 
      label={current.label}
      sx={{
        bgcolor: current.bg,
        color: current.text,
        fontWeight: 600,
        fontSize: '0.62rem',
        height: 20,
        borderRadius: 5,
        border: 'none',
        '& .MuiChip-label': { px: 1 }
      }}
      size="small"
    />
  );
}

function SourceBadge({ source }: { source: BookingSource }) {
  const current = SOURCE_MAP[source] || { bg: '#FAF8F5', text: '#8A7268', label: source };
  return (
    <Chip 
      label={current.label}
      sx={{
        bgcolor: current.bg,
        color: current.text,
        fontWeight: 600,
        fontSize: '0.62rem',
        height: 20,
        borderRadius: 5,
        border: 'none',
        '& .MuiChip-label': { px: 1 }
      }}
      size="small"
    />
  );
}

interface ClientsTableProps {
  clients: ApiClient[];
  loading: boolean;
  onSelectClient: (c: ApiClient) => void;
}

export function ClientsTable({ clients, loading, onSelectClient }: ClientsTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Paper 
      sx={{ 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        boxShadow: 'none',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#C9847A',
          boxShadow: '0 4px 20px rgba(201, 132, 122, 0.04)',
        }
      }}
    >
      {loading ? (
        <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CircularProgress size={32} sx={{ color: 'primary.main', mx: 'auto', my: 2 }} />
        </Box>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                {['Client', 'Phone', 'Email', 'Type', 'Source', 'Bookings', 'Notes', ''].map(h => (
                  <TableCell key={h} sx={{ py: 1.5, fontSize: '0.62rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client, idx) => {
                const avatarStyle = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <TableRow 
                    key={client.id} 
                    sx={{ 
                      transition: 'background-color 0.2s', 
                      '&:hover': { 
                        bgcolor: 'rgba(201, 132, 122, 0.03)',
                        '& button': { opacity: 1 } 
                      } 
                    }}
                  >
                    {/* Client Name + Avatar */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.68rem', 
                            fontWeight: 700, 
                            bgcolor: avatarStyle.bg, 
                            color: avatarStyle.tc 
                          }}
                        >
                          {getInitials(client.name)}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                          {client.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Phone */}
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {client.phone_number}
                    </TableCell>

                    {/* Email */}
                    <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                      {client.email || <span style={{ color: 'rgba(0,0,0,0.15)' }}>—</span>}
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      <ClientTypeBadge type={client.client_type} />
                    </TableCell>

                    {/* Source Badge */}
                    <TableCell>
                      <SourceBadge source={client.booking_source} />
                    </TableCell>

                    {/* Bookings count */}
                    <TableCell sx={{ fontSize: '1rem', fontWeight: 600, color: 'primary.main', fontFamily: "'Cormorant Garamond', serif" }}>
                      {client.total_bookings ?? '—'}
                    </TableCell>

                    {/* Notes */}
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.notes || <span style={{ color: 'rgba(0,0,0,0.15)' }}>—</span>}
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      <Button
                        onClick={() => onSelectClient(client)}
                        variant="outlined"
                        size="small"
                        sx={{
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          borderRadius: 2,
                          fontSize: '0.72rem',
                          py: 0.5,
                          px: 1.5,
                          borderColor: 'rgba(201, 132, 122, 0.3)',
                          color: 'primary.main',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(201, 132, 122, 0.05)'
                          }
                        }}
                      >
                        History
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary', fontSize: '0.82rem' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>👥</div>
                    No clients found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default ClientsTable;
