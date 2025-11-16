import React from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, Paper, Chip, Avatar, useTheme } from '@mui/material';
import { CheckCircle, TrendingUp, Security, PhoneIphone, Cloud, RocketLaunch, SupportAgent, Build, Bolt, AttachMoney } from '@mui/icons-material';

const demoSections = [
  {
    title: 'Dashboard',
    icon: <TrendingUp color="primary" />, 
    color: 'primary',
    highlights: [
      'Real-time metrics and system health',
      'Customizable widgets and charts',
      'Instant access to key business data'
    ]
  },
  {
    title: 'User Management',
    icon: <Security color="secondary" />, 
    color: 'secondary',
    highlights: [
      'Role-based access control',
      'Advanced search & filtering',
      'Bulk user import/export'
    ]
  },
  {
    title: 'Broadcast Management',
    icon: <Bolt color="warning" />, 
    color: 'warning',
    highlights: [
      'Send announcements to all or selected roles',
      'Schedule, edit, and track broadcasts',
      'Read receipt tracking for compliance'
    ]
  },
  {
    title: 'Commission Management',
    icon: <AttachMoney color="success" />, 
    color: 'success',
    highlights: [
      'Flexible commission structures',
      'Approval workflows & audit trails',
      'Document uploads and payout records'
    ]
  },
  {
    title: 'Audit Logs',
    icon: <CheckCircle color="info" />, 
    color: 'info',
    highlights: [
      'Full traceability of all actions',
      'Filter by user, date, or action',
      'Meets compliance requirements'
    ]
  },
  {
    title: 'System Settings',
    icon: <Build color="secondary" />, 
    color: 'secondary',
    highlights: [
      'Global preferences & feature toggles',
      'Session timeout configuration',
      'Secure, admin-only access'
    ]
  },
  {
    title: 'Ticket Management',
    icon: <SupportAgent color="primary" />, 
    color: 'primary',
    highlights: [
      'Create, assign, and resolve tickets',
      'Technical, withdrawal, and deposit types',
      'Attachments and full ticket history'
    ]
  },
  {
    title: 'My Broadcasts',
    icon: <Bolt color="warning" />, 
    color: 'warning',
    highlights: [
      'View all received broadcasts',
      'Read/unread status',
      'Quick actions for each broadcast'
    ]
  },
  {
    title: 'Messages',
    icon: <SupportAgent color="info" />, 
    color: 'info',
    highlights: [
      'Direct and group messaging',
      'Chat history and search',
      'Real-time notifications'
    ]
  },
  {
    title: 'Resource Center',
    icon: <Cloud color="primary" />, 
    color: 'primary',
    highlights: [
      'Downloadable resources and forms',
      'Role-based access',
      'Featured and recommended content'
    ]
  },
  {
    title: 'Wallet',
    icon: <AttachMoney color="success" />, 
    color: 'success',
    highlights: [
      'Manage balances and transactions',
      'Payouts and auditability',
      'Secure digital wallet'
    ]
  },
  {
    title: 'My Tickets',
    icon: <SupportAgent color="primary" />, 
    color: 'primary',
    highlights: [
      'Track and manage your tickets',
      'Personal dashboard',
      'Easy status updates'
    ]
  },
  {
    title: 'My Commissions',
    icon: <AttachMoney color="success" />, 
    color: 'success',
    highlights: [
      'View/download commission statements',
      'Payout history',
      'Personalized commission info'
    ]
  },
  {
    title: 'User Guide Management',
    icon: <Build color="secondary" />, 
    color: 'secondary',
    highlights: [
      'Manage help docs and guides',
      'Onboarding support',
      'Admin-only access'
    ]
  },
  {
    title: 'My User Guide',
    icon: <Build color="info" />, 
    color: 'info',
    highlights: [
      'Access user guides and FAQs',
      'Support documentation',
      'Self-service help'
    ]
  },
  {
    title: 'Session Timer',
    icon: <Bolt color="warning" />, 
    color: 'warning',
    highlights: [
      'Visual timer and warning dialog',
      'Reset session easily',
      'Best practices for security'
    ]
  },
  {
    title: 'Notifications',
    icon: <Bolt color="info" />, 
    color: 'info',
    highlights: [
      'Unified notification panel',
      'System, broadcast, and ticket updates',
      'Real-time alerts'
    ]
  },
  {
    title: 'Technical Details',
    icon: <Build color="primary" />, 
    color: 'primary',
    highlights: [
      'Technical, withdrawal, deposit details',
      'File attachments',
      'Audit history and status tracking'
    ]
  },
  {
    title: 'Architecture & Tech Stack',
    icon: <RocketLaunch color="secondary" />, 
    color: 'secondary',
    highlights: [
      'React, TypeScript, Material UI (frontend)',
      'ASP.NET Core, EF Core, PostgreSQL (backend)',
      'Modular, scalable, secure'
    ]
  },
  {
    title: 'Demo Tips',
    icon: <CheckCircle color="success" />, 
    color: 'success',
    highlights: [
      'Use the side menu to explore',
      'Each section is live and interactive',
      'Ask for a guided walkthrough!'
    ]
  },
  {
    title: 'In Development',
    icon: <RocketLaunch color="warning" />, 
    color: 'warning',
    highlights: [
      'Advanced analytics',
      'AI-powered ticket triage',
      'Push notifications',
      'Third-party integrations',
      'Rapid, continuous improvement'
    ]
  },
  {
    title: 'Why Choose This Solution?',
    icon: <CheckCircle color="primary" />, 
    color: 'primary',
    highlights: [
      'Speed, security, scalability',
      'Modular, customizable',
      'Enterprise & SMB ready',
      'Rapid feature delivery'
    ]
  },
  {
    title: 'Deployment & Cost Efficiency',
    icon: <AttachMoney color="success" />, 
    color: 'success',
    highlights: [
      'Cloud & on-premise ready',
      'Minimal infrastructure',
      'Fast setup, low maintenance',
      'Transparent pricing, no hidden costs'
    ]
  },
  {
    title: 'Mobile Experience',
    icon: <PhoneIphone color="info" />, 
    color: 'info',
    highlights: [
      'Fully responsive',
      'Mobile-optimized',
      'Fast load times',
      'Intuitive navigation'
    ]
  },
  {
    title: 'Client Value',
    icon: <SupportAgent color="secondary" />, 
    color: 'secondary',
    highlights: [
      'Maximize ROI',
      'Fast deployment, low TCO',
      'Business-driven features',
      'Dedicated support team'
    ]
  }
];


const DemoPage: React.FC = () => {
  const theme = useTheme();
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Typography variant="h3" gutterBottom color="primary">
        🚀 eConnectOne Solution Demo & Technical Overview
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
        Welcome to the comprehensive demo of eConnectOne - a modern, full-stack business management solution. This page showcases all features, technical capabilities, and business value. Each section highlights key functionality designed to streamline operations, enhance productivity, and deliver measurable ROI.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
        Note: This demo page is accessible to Master Admin and Admin users only. For hands-on experience, navigate through the actual features using the side menu.
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Paper elevation={3} sx={{ p: 3, background: theme.palette.background.default }}>
        <List>
          {demoSections.map((section) => (
            <React.Fragment key={section.title}>
              <ListItem alignItems="flex-start" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette[section.color || 'primary'].main, mr: 2 }}>
                  {section.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette[section.color || 'primary'].main, fontWeight: 700, mb: 0.5 }}>
                    {section.title}
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                    {section.highlights.map((point: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: 2, fontSize: '1rem', color: theme.palette.text.primary }}>
                        <Chip label={point} color={section.color || 'primary'} size="small" sx={{ mr: 1, mb: 0.5, fontWeight: 500 }} />
                      </li>
                    ))}
                  </Box>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" color="text.secondary">
          For a live demonstration, interact with the actual sections from the side menu. This page is for overview and presentation purposes.
        </Typography>
      </Box>
    </Box>
  );
};

export default DemoPage;
