// This file contains step-by-step guides for management tasks (admin/master admin) only.
// These will be used in the User Guide Management page.

export const managementGuides = [
  {
    section: 'User Management',
    steps: [
      'Navigate to "User Management" from the side menu (Admin/Master Admin only).',
      'Toggle between Tile and List view using the view mode buttons for better visualization.',
      'Switch between "Basic View" and "Full Details View" to see different levels of user information.',
      'Use filters to search by username, email, role (Admin, Master Admin, HO User, CSP), or status (Active/Inactive).',
      'Click "View" icon to see complete user details in a dialog.',
      'Click "Edit" icon to modify user information, roles, or permissions.',
      'Click "Delete" icon to soft-delete users (data can be recovered if needed).',
      'In Full Details View, expand rows to see additional user details, documents, and bank information.',
      'Use "Download CSV" to export user data for reporting and analysis.',
      'Create new users by clicking the "Add User" button and filling in required information.'
    ]
  },
  {
    section: 'Ticket Management',
    steps: [
      'Go to "Ticket Management" from the side menu.',
      'Use comprehensive filters: status, type, priority, date range, and assigned user.',
      'Switch between Table and Card view using the view toggle for different perspectives.',
      'Select multiple tickets using checkboxes for bulk operations.',
      'Use "Bulk Actions" to approve, assign, or update status for multiple tickets at once.',
      'Click on any ticket to view full details, history, comments, and attachments.',
      'Assign tickets to specific users or teams for resolution.',
      'Add internal comments and update ticket status as work progresses.',
      'Upload additional documents or evidence to tickets.',
      'Use the "Refresh" button to reload the ticket list and see latest updates.',
      'Export ticket data for reporting and analysis.'
    ]
  },
  {
    section: 'Commission Management',
    steps: [
      'Access "Commission Management" from the side menu.',
      'Use tabs to navigate: View Commissions, Create Commission, Bulk Upload, Activity Log.',
      'In "View Commissions" tab, toggle between Tile and List view.',
      'Filter commissions by year, month, status, or user.',
      'For Master Admin: Edit commission details by clicking the Edit icon.',
      'For Master Admin: Delete commissions if needed (with confirmation).',
      'For Master Admin: Approve or reject commissions using the status update dialog.',
      'In "Create Commission" tab, fill in user, period, amounts, and description.',
      'In "Bulk Upload" tab, download the template, fill it with data, and upload the CSV file.',
      'View "Activity Log" to track all commission-related changes and approvals.',
      'Download commission reports for accounting and reconciliation.'
    ]
  },
  {
    section: 'Broadcast Management',
    steps: [
      'Navigate to "Broadcast Management" from the side menu.',
      'Toggle between Tile and List view for different visualization options.',
      'Click "Create Broadcast" to compose a new announcement.',
      'Select target audience: All Users or specific roles (Master Admin, Admin, HO User, CSP).',
      'Set priority level: High (urgent), Medium (important), or Low (informational).',
      'Write your message title and content clearly and concisely.',
      'Schedule broadcasts for future delivery or send immediately.',
      'Edit existing broadcasts before they are sent (if not yet delivered).',
      'Delete broadcasts that are no longer needed.',
      'Track read receipts to see who has viewed your broadcasts.',
      'Filter broadcasts by priority, date, or status to manage communications effectively.'
    ]
  },
  {
    section: 'Wallet Management',
    steps: [
      'Go to "Wallet Management" from the side menu (Master Admin/Admin only).',
      'Toggle between Tile and List view to see user wallets in different formats.',
      'Use filters to search by username, role, or wallet status.',
      'View each user\'s wallet balance, pending amounts, and status.',
      'Click "Deposit" to add funds to a user\'s wallet with description.',
      'Click "Withdraw" to deduct funds from a user\'s wallet (with proper authorization).',
      'Click "Limits" to set or update withdrawal limits and minimum balance for users.',
      'Select multiple users for bulk deposit or withdrawal operations.',
      'Review transaction history for each user to ensure accuracy.',
      'Monitor wallet health with color-coded balance indicators (green: healthy, yellow: low, red: negative).',
      'Export wallet data for financial reporting and reconciliation.'
    ]
  },
  {
    section: 'System Settings',
    steps: [
      'Access "System Settings" from the side menu (Master Admin only).',
      'View and manage role-based permissions for all features.',
      'Filter permissions by role or feature name.',
      'Toggle permissions: View, Create, Edit, Delete for each role and feature.',
      'Click "Add Permission" to create new permission rules.',
      'Delete permission rules that are no longer needed.',
      'Configure session timeout settings and security policies.',
      'Set up global preferences and feature toggles.',
      'Save all changes to apply new settings across the system.',
      'Test permission changes with different user roles to ensure proper access control.'
    ]
  },
  {
    section: 'Audit Logs',
    steps: [
      'Navigate to "Audit Logs" from the side menu.',
      'View comprehensive logs of all system activities and changes.',
      'Filter logs by date range to focus on specific time periods.',
      'Filter by user to see all actions performed by a specific person.',
      'Filter by action type (Create, Update, Delete, Login, etc.).',
      'Filter by entity type (User, Ticket, Commission, Broadcast, etc.).',
      'Review detailed information including timestamp, user, action, and affected data.',
      'Export audit logs for compliance reporting and security analysis.',
      'Use audit logs for troubleshooting and investigating issues.',
      'Maintain audit trail for regulatory compliance and accountability.'
    ]
  },
  {
    section: 'Resource Management',
    steps: [
      'Go to "Resource Center" management section.',
      'Upload new resources, documents, forms, and guides.',
      'Categorize resources by type and target audience.',
      'Set permissions to control who can access specific resources.',
      'Mark resources as "Featured" or "Recommended" for visibility.',
      'Edit resource details, descriptions, and metadata.',
      'Delete outdated or incorrect resources.',
      'Monitor resource download statistics and usage.',
      'Organize resources in folders or categories for easy navigation.',
      'Keep resources up-to-date and relevant for users.'
    ]
  },
  {
    section: 'User Guide Management',
    steps: [
      'Access "User Guide Management" to maintain help documentation.',
      'Review and update step-by-step guides for all features.',
      'Add new guides when new features are released.',
      'Update FAQs based on common user questions and issues.',
      'Organize guides by user role and feature area.',
      'Ensure guides are clear, accurate, and easy to follow.',
      'Test guides with actual users to ensure effectiveness.',
      'Keep documentation synchronized with system changes and updates.'
    ]
  }
];
