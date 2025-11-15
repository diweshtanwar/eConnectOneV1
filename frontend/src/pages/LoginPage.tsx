import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, Paper, CircularProgress, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme(); // Get the theme object

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      navigate('/dashboard');
    } catch (error: any) {
      // Handle different error response formats
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        let errorMessage = errorData.message || 'Login failed. Please try again.';
        
        // Add remaining attempts info if available
        if (errorData.remainingAttempts !== undefined) {
          errorMessage += ` (${errorData.remainingAttempts} attempts remaining)`;
        }
        
        // Add warning message if account is about to be locked
        if (errorData.warningMessage) {
          errorMessage += ` ${errorData.warningMessage}`;
        }
        
        setError(errorMessage);
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#00674F', // Emerald green background
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: theme.palette.background.paper, // Use theme's paper background
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" color="primary">
            eConnectOne
          </Typography>
          <Typography component="h2" variant="subtitle1" color="textSecondary" gutterBottom>
            Sign in to your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color={loading ? "primary" : "secondary"} // Change color based on loading state
              sx={{ mt: 3, mb: 2 }}
              disabled={loading} // Disable button when loading
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} // Add loading icon
            >
              {loading ? 'Signing In...' : 'Sign In'} {/* Change text based on loading state */}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 3 }}>
            Only eConnect personnel & CSP are allowed to login to this system
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}