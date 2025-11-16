import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { managementGuides } from './managementGuideSteps';

const adminFaqs = [
  {
    question: 'How do I manage users?',
    answer: 'Go to "User Management" from the side menu. Toggle between Tile and List view, switch to "Full Details View" for comprehensive information, use filters to search users, click View/Edit/Delete icons for actions, expand rows in Full Details View to see documents and bank info, and download CSV for reporting. You can create new users, modify roles, reset passwords, and soft-delete users as needed.'
  },
  {
    question: 'How do I manage tickets efficiently?',
    answer: 'In "Ticket Management", use filters to find specific tickets, switch between Table and Card view, select multiple tickets for bulk operations, assign tickets to team members, update status and add comments, upload supporting documents, and use the Refresh button to see latest updates. Bulk Actions allow you to process multiple tickets at once for efficiency.'
  },
  {
    question: 'How do I create and manage commissions?',
    answer: 'Access "Commission Management" and use the tabs: "View Commissions" to see all records with Tile/List view toggle, "Create Commission" to add individual records, "Bulk Upload" to import multiple commissions via CSV, and "Activity Log" to track changes. Master Admins can edit, delete, and approve/reject commissions.'
  },
  {
    question: 'How do I send broadcasts to users?',
    answer: 'Go to "Broadcast Management", click "Create Broadcast", select target audience (All Users or specific roles), set priority level (High/Medium/Low), write your message, and send immediately or schedule for later. You can edit broadcasts before delivery, delete them, track read receipts, and filter by priority or date.'
  },
  {
    question: 'How do I manage user wallets?',
    answer: 'Navigate to "Wallet Management" (Master Admin/Admin only), toggle between Tile and List view, use filters to find users, view wallet balances and status, click "Deposit" to add funds or "Withdraw" to deduct funds, click "Limits" to set withdrawal limits, and use bulk operations for multiple users. Monitor wallet health with color-coded indicators.'
  },
  {
    question: 'How do I view audit logs?',
    answer: 'Navigate to "Audit Logs" to see comprehensive logs of all system activities. Filter by date range, user, action type (Create/Update/Delete/Login), or entity type (User/Ticket/Commission/Broadcast). Review detailed information including timestamp, user, action, and affected data. Export logs for compliance reporting and security analysis.'
  },
  {
    question: 'How do I configure system settings?',
    answer: 'System Settings is available for Master Admins only. View and manage role-based permissions for all features, toggle permissions (View/Create/Edit/Delete) for each role, add new permission rules, delete outdated rules, configure session timeout and security policies, and set global preferences. Always test permission changes with different user roles.'
  },
  {
    question: 'How do I manage resources and documents?',
    answer: 'In "Resource Center" management, upload new resources, categorize by type and audience, set access permissions, mark as Featured or Recommended, edit details and metadata, delete outdated resources, monitor download statistics, and organize in folders. Keep resources up-to-date and relevant for users.'
  },
  {
    question: 'What are the different view modes available?',
    answer: 'Most management pages offer Tile view (cards) and List view (table) options. Use the view toggle buttons to switch between views. Tile view provides visual cards with key information, while List view shows data in a compact table format. Choose based on your preference and task requirements.'
  },
  {
    question: 'How do I perform bulk operations?',
    answer: 'In pages like Ticket Management and Wallet Management, select multiple items using checkboxes, then use the "Bulk Actions" button to perform operations on all selected items at once. This includes bulk approve, assign, deposit, withdraw, and status updates for improved efficiency.'
  },
  {
    question: 'How do I export data for reporting?',
    answer: 'Many pages offer export functionality. In User Management, click "Download CSV" to export user data. In Audit Logs, Wallet Management, and Commission Management, use export buttons to download data in CSV or Excel format for reporting, analysis, and record-keeping.'
  },
  {
    question: 'How do I maintain user guides and documentation?',
    answer: 'Access "User Guide Management" to maintain help documentation. Review and update step-by-step guides, add new guides for new features, update FAQs based on user questions, organize by role and feature area, ensure clarity and accuracy, test with users, and keep synchronized with system changes.'
  },
  {
    question: 'What security best practices should I follow?',
    answer: 'Always log out when finished, use strong passwords and change them regularly, monitor audit logs for suspicious activity, set appropriate user permissions based on roles, review and approve transactions carefully, keep session timeout settings reasonable, and regularly review user access and permissions to ensure security.'
  }
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
