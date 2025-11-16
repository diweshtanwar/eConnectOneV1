import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { userGuides } from './userGuideSteps';

const userFaqs = [
  {
    question: 'How do I create a ticket?',
    answer: 'Click on "Create Ticket" in the side menu, select the ticket type (Technical, Withdrawal, or Deposit), fill in all required fields including title, description, and priority, attach any supporting documents, and click "Submit". You will receive a confirmation and can track your ticket in "My Tickets".'
  },
  {
    question: 'How do I check my ticket status?',
    answer: 'Go to "My Tickets" from the side menu to view all tickets you have created. You can see the current status (Open, In Progress, Resolved, Closed), add comments, upload additional documents, and track the progress of each ticket in real-time.'
  },
  {
    question: 'How do I view my commissions?',
    answer: 'Navigate to "My Commissions" (available for CSP users) to see your commission details. You can filter by month and year, view detailed breakdowns including base commission, bonus, deductions, tax, and net payable, check status, and download commission statements.'
  },
  {
    question: 'How do I update my profile?',
    answer: 'Click on your profile icon in the top right corner and select "Profile". Click "Edit Profile" to update your full name, email, mobile number, and emergency contact. You can also upload documents and reset your password from this page. Remember to save all changes.'
  },
  {
    question: 'How do I check my wallet balance?',
    answer: 'CSP users can access "My Wallet" from the side menu to view wallet balance, pending amounts, and transaction history. You can filter transactions by status or type and view detailed information for each transaction. Note: Always verify with your bank account statement for accuracy.'
  },
  {
    question: 'How do I read broadcasts and announcements?',
    answer: 'Go to "My Broadcasts" to view all announcements sent to you. Unread broadcasts are highlighted. Click on any broadcast to read the full message and mark it as read. You can filter by priority or date range to find specific broadcasts.'
  },
  {
    question: 'What happens when my session is about to expire?',
    answer: 'You will see a session timer in the top navigation bar. When your session is about to expire (5 minutes remaining), a warning dialog will appear. Click "Stay Logged In" to extend your session, or click the "Reset" button visible in the timer. For security, you will be automatically logged out when the session expires.'
  },
  {
    question: 'How do I send messages to other users?',
    answer: 'Access "Messages" from the side menu. Click "Compose" to send a new message, select recipients, write your message, and send. You can view inbox, sent messages, reply to conversations, and receive real-time notifications for new messages.'
  },
  {
    question: 'Where can I find downloadable forms and resources?',
    answer: 'Navigate to "Resource Center" from the side menu. Browse through available documents, guides, and templates. Use search and filters to find specific resources, then click the download button to save them to your device.'
  },
  {
    question: 'How do I change my password?',
    answer: 'Go to your Profile page by clicking your profile icon in the top right corner. Click the "Reset Password" button, enter your new password, confirm it, and submit. Make sure your password is at least 6 characters long and secure.'
  },
  {
    question: 'Can I switch between different view modes?',
    answer: 'Yes! Many pages (My Tickets, My Broadcasts, My Commissions, My Wallet) offer Tile view (cards) and List view (table) options. Use the view toggle buttons at the top of the page to switch between views based on your preference.'
  },
  {
    question: 'Who can I contact for support?',
    answer: 'For technical issues, create a Technical ticket. For general inquiries, use the Messages feature to contact administrators. You can also refer to this User Guide for step-by-step instructions on using various features.'
  }
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
