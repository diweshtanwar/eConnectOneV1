// This file contains step-by-step guides for each main screen/process in the portal.
// These will be consolidated into the User Guide page.

export const userGuides = [
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
    section: 'Create Ticket',
    steps: [
      'Click on Create Ticket in the side menu.',
      'Select the ticket type (Technical, Withdrawal, Deposit).',
      'Fill in the required details and attach files if needed.',
      'Click Submit to create the ticket.',
      'You will be redirected to My Tickets to view your new ticket.'
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
    section: 'Profile',
    steps: [
      'Click on your profile icon and select Profile.',
      'View and update your personal information.',
      'Upload or download documents as required.',
      'Save changes to update your profile.'
    ]
  }
];
