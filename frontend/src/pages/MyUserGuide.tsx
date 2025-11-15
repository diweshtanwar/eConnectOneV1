import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { userGuides } from './userGuideSteps';

const userFaqs = [
  {
    question: 'How do I create a ticket?',
    answer: 'Click on Create Ticket in the side menu, fill in the required details, and submit.'
  },
  {
    question: 'How do I check my ticket status?',
    answer: 'Go to My Tickets to view all tickets you have created and their current status.'
  },
  {
    question: 'How do I view my commissions?',
    answer: 'Navigate to My Commissions to see your commission details and history.'
  },
  {
    question: 'How do I update my profile?',
    answer: 'Click on your profile icon and select Profile to update your personal information.'
  },
  // Add more user FAQs as needed
];

export const MyUserGuide: React.FC = () => {
  // Only include user-facing guides (exclude management tasks)
  const filteredGuides = userGuides.filter(
    g => !['Ticket Management', 'Commission Management', 'User Management'].includes(g.section)
  );
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>User Guide & FAQs</Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        This page provides step-by-step guides for each main user process and answers to common questions.
      </Typography>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Step-by-Step Guides</Typography>
      {filteredGuides.map((guide, idx) => (
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
      {userFaqs.map((faq, idx) => (
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
};
