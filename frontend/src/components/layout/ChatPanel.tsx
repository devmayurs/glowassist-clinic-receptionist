import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, TextField, IconButton } from '@mui/material';
import { useAppStore } from '../../store/useAppStore';
import { useChat } from '../../hooks/useChat';
import CallBanner from '../ui/CallBanner';
import ModeToggle from '../ui/ModeToggle';

export default function ChatPanel() {
  const {
    messages,
    isTyping,
    inputText,
    setInputText,
    sendMessage,
    bookingStage,
    resetBooking,
  } = useChat();

  const isCallActive = useAppStore((s) => s.isCallActive);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Sync expanded state with localStorage
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('glowassist_chat_panel_expanded');
    return saved === null ? true : saved === 'true';
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('glowassist_chat_panel_expanded', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping, isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        sendMessage(inputText);
      }
    }
  };

  const formatTime = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickReplies = [
    bookingStage === 'none' 
      ? { label: '📅 Book Now', text: 'I want to book an appointment' }
      : { label: '❌ Cancel Booking', text: 'cancel' },
    { label: '💉 Botox', text: 'Tell me about Botox Aesthetic sessions' },
    { label: '✨ Facials', text: 'Tell me about your facial treatments' },
    { label: '💰 Pricing', text: 'What are your prices?' },
    { label: '🕐 Hours', text: 'What are your working hours?' },
  ];

  // Minimized state renders as a compact, luxury pill
  if (!isExpanded) {
    return (
      <Paper
        elevation={4}
        onClick={toggleExpand}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          py: 1.75,
          borderRadius: 30,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #C9847A 0%, #B8965A 100%)',
          color: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(201, 132, 122, 0.28)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-3px) scale(1.02)',
            boxShadow: '0 12px 40px rgba(201, 132, 122, 0.38)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          ✦
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.5px', fontFamily: "'Jost', sans-serif" }}>
            Chat with Aria
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
            Online AI Concierge
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Expanded state renders as a gorgeous luxury card
  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1200,
        width: 380,
        height: 600,
        border: '1px solid #E8DDD6',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(42, 31, 26, 0.16)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {isCallActive && <CallBanner />}

      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid #E8DDD6', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          background: 'linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%)',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #C9847A 0%, #E8A89F 100%)',
            border: '2px solid rgba(201, 132, 122, 0.3)',
            boxShadow: '0 2px 8px rgba(201, 132, 122, 0.1)',
          }}
        >
          ✦
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: '#1C1410', fontSize: '1.1rem' }}>
            Aria — AI Concierge
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              className="animate-glow"
              sx={{ width: 6, height: 6, bgcolor: '#7A9E7E', borderRadius: '50%' }} 
            />
            <Typography sx={{ color: '#7A9E7E', fontSize: '0.68rem', fontWeight: 600 }}>
              Online & Attending
            </Typography>
          </Box>
        </Box>
        <ModeToggle />
        <IconButton 
          onClick={toggleExpand}
          size="small"
          sx={{ 
            color: '#8A7268',
            '&:hover': { bgcolor: '#FAF8F5' }
          }}
        >
          ➖
        </IconButton>
      </Box>

      {/* Messages */}
      <Box 
        ref={chatBoxRef}
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          bgcolor: '#FAF8F5',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <Box 
              key={msg.id} 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
                maxWidth: '85%',
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.7rem',
                  bgcolor: isUser ? '#1C1410' : '#C9847A',
                  color: '#FFFFFF',
                  mt: 0.5,
                }}
              >
                {isUser ? '👤' : '✦'}
              </Avatar>
              <Box>
                <Paper
                  sx={{
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 3,
                    borderBottomLeftRadius: isUser ? 12 : 2,
                    borderBottomRightRadius: isUser ? 2 : 12,
                    bgcolor: isUser ? '#C9847A' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#2A1F1A',
                    border: isUser ? 'none' : '1px solid #E8DDD6',
                    boxShadow: 'none',
                  }}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <Typography 
                      key={i} 
                      sx={{ 
                        fontSize: '0.8rem', 
                        lineHeight: 1.5, 
                        fontFamily: "'Jost', sans-serif",
                        mt: i > 0 ? 0.75 : 0 
                      }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Paper>
                <Typography 
                  sx={{ 
                    fontSize: '0.6rem', 
                    color: '#8A7268', 
                    mt: 0.5, 
                    textAlign: isUser ? 'right' : 'left' 
                  }}
                >
                  {formatTime(msg.timestamp)}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {isTyping && (
          <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-start' }}>
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#C9847A' }}>
              ✦
            </Avatar>
            <Paper 
              sx={{ 
                px: 2, 
                py: 1.5, 
                borderRadius: 3, 
                borderBottomLeftRadius: 2,
                bgcolor: '#FFFFFF', 
                border: '1px solid #E8DDD6',
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
                boxShadow: 'none',
              }}
            >
              <Box sx={{ width: 5, height: 5, bgcolor: '#8A7268', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
              <Box sx={{ width: 5, height: 5, bgcolor: '#8A7268', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.2s' }} />
              <Box sx={{ width: 5, height: 5, bgcolor: '#8A7268', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.4s' }} />
            </Paper>
          </Box>
        )}
      </Box>

      {/* Quick Replies */}
      <Box 
        sx={{ 
          px: 1.5, 
          py: 1.25, 
          borderTop: '1px solid #E8DDD6', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 0.75,
          bgcolor: '#FFFFFF'
        }}
      >
        {quickReplies.map((btn) => (
          <Button
            key={btn.text}
            variant="outlined"
            onClick={() => {
              if (btn.text === 'cancel') {
                resetBooking();
                sendMessage('Booking cancelled. How else can I assist you?');
              } else {
                sendMessage(btn.text);
              }
            }}
            sx={{
              borderRadius: '16px',
              fontSize: '0.7rem',
              py: 0.25,
              px: 1.25,
              borderColor: '#C9847A',
              color: '#C9847A',
              fontFamily: "'Jost', sans-serif",
              '&:hover': {
                bgcolor: '#C9847A',
                color: '#FFFFFF',
                borderColor: '#C9847A',
              }
            }}
          >
            {btn.label}
          </Button>
        ))}
      </Box>

      {/* Input Field */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #E8DDD6', display: 'flex', gap: 1.25, alignItems: 'flex-end', bgcolor: '#FFFFFF' }}>
        <TextField
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={bookingStage !== 'none' ? `Enter ${bookingStage}…` : "Type a client message…"}
          multiline
          maxRows={3}
          variant="outlined"
          size="small"
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              fontSize: '0.8rem',
              fontFamily: "'Jost', sans-serif",
              bgcolor: '#F4EFE8',
              transition: 'background 0.2s, border-color 0.2s',
              '& fieldset': { borderColor: '#E8DDD6' },
              '&:hover fieldset': { borderColor: '#C9847A' },
              '&.Mui-focused fieldset': { borderColor: '#C9847A' },
              '&.Mui-focused': { bgcolor: '#FFFFFF' }
            }
          }}
        />
        <IconButton
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            bgcolor: '#C9847A',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#A65F55' },
            '&.Mui-disabled': { bgcolor: '#E8DDD6', color: '#FFFFFF' },
            flexShrink: 0,
          }}
        >
          ➤
        </IconButton>
      </Box>
    </Paper>
  );
}
