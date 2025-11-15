import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { managementGuides } from './managementGuideSteps';

const adminFaqs = [
  {
    question: 'How do I manage users?',
    answer: 'Go to User Management from the side menu. You can add, edit, or deactivate users as needed.'
  },
  {
    question: 'How do I view audit logs?',
    answer: 'Navigate to Audit Logs to see all system activities and changes.'
  },
  {
    question: 'How do I configure system settings?',
    answer: 'System Settings is available for Master Admins. You can update portal-wide configurations there.'
  },
  {
    question: 'How do I manage tickets?',
    answer: 'Ticket Management allows you to view, assign, and process all tickets in the system.'
  },
  // Add more admin/master admin FAQs as needed
];

export const UserGuideManagement: React.FC = () => (
  <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
    <Typography variant="h4" sx={{ mb: 2 }}>User Guide Management</Typography>
    <Typography variant="subtitle1" sx={{ mb: 3 }}>
      This page provides step-by-step guides for all management tasks and answers to common admin questions.
    </Typography>

    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Step-by-Step Guides for Management Tasks</Typography>
    {managementGuides.map((guide, idx) => (
      <Accordion key={guide.section} defaultExpanded={idx === 0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">{guide.section}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {guide.steps.map((step, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <Typography variant="body2">{step}</Typography>
              </li>
            ))}
          </ol>
        </AccordionDetails>
      </Accordion>
    ))}

    <Divider sx={{ my: 4 }} />

    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Frequently Asked Questions (FAQs)</Typography>
    {adminFaqs.map((faq, idx) => (
      <Accordion key={idx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">{faq.question}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">{faq.answer}</Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);
