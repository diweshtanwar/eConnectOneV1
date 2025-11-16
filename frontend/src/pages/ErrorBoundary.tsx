import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/eConnectOneV1/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            p: 2,
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={24}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <BugReport sx={{ fontSize: 80, color: '#f5576c', mb: 2 }} />
              <Typography variant="h3" gutterBottom fontWeight={700} color="text.primary">
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                We're sorry for the inconvenience. An unexpected error has occurred. 
                Please try refreshing the page or return to the home page.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    background: '#f5f5f5',
                    borderRadius: 2,
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                    {this.state.error.toString()}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                  sx={{ px: 4, py: 1.5, borderRadius: 50, textTransform: 'none', fontSize: '1rem' }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Home />}
                  onClick={this.handleReset}
                  sx={{ px: 4, py: 1.5, borderRadius: 50, textTransform: 'none', fontSize: '1rem' }}
                >
                  Go to Home
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
