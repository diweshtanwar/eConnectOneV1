// This file contains step-by-step guides for management tasks (admin/master admin) only.
// These will be used in the User Guide Management page.

export const managementGuides = [
  {
    section: 'Ticket Management',
    steps: [
      'Go to Ticket Management from the side menu.',
      'Use the filters at the top to search by status, type, date, or assigned user.',
      'Switch between Table and Card view using the view toggle.',
      'Click on a ticket to view details, update status, or add comments.',
      'Admins can use Bulk Actions to approve, assign, or process multiple tickets.',
      'Use the Refresh button to reload the ticket list.'
    ]
  },
  {
    section: 'Commission Management',
    steps: [
      'Go to Commission Management from the side menu.',
      'Use the tabs to switch between View Commissions, Create Commission, Bulk Upload, and Activity Log.',
      'Admins can create or bulk upload commissions using the respective tabs.',
      'View commission details, status, and history in the View Commissions tab.'
    ]
  },
  {
    section: 'User Management',
    steps: [
      'Go to User Management from the side menu (Admins only).',
      'Use filters to search by role, status, or date.',
      'Add, edit, or deactivate users as needed.',
      'Reset user passwords or view user details from the actions column.'
    ]
  },
  {
    section: 'System Settings',
    steps: [
      'Go to System Settings from the side menu (Master Admin only).',
      'Update portal-wide configurations as required.',
      'Save changes to apply new settings.'
    ]
  },
  {
    section: 'Audit Logs',
    steps: [
      'Go to Audit Logs from the side menu.',
      'View all system activities and changes.',
      'Filter logs by date, user, or action type.'
    ]
  }
];
