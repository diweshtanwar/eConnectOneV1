import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { UserManagementTabs } from './pages/UserManagementTabs';
import { AuditLogs } from './pages/AuditLogs';
import { SystemSettings } from './pages/SystemSettings';
import { ProfilePage } from './pages/ProfilePage';

// New imports for Ticket Management Pages
import { TicketManagement } from './pages/TicketManagement';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetails } from './pages/TicketDetails';

// New imports for Communication and Resource Center
import { Communications } from './pages/Communications';
import { Messages } from './pages/Messages';
import { ResourceCenter } from './pages/ResourceCenter';

// New imports for Wallet and Commission Management
import { Wallet } from './pages/Wallet';
import { WalletManagement } from './pages/WalletManagement';
import { CommissionManagement } from './pages/CommissionManagement';
import { MyCommissions } from './pages/MyCommissions';
import { Analytics as AnalyticsPage } from './pages/Analytics';
import { Layout } from './components/ModernLayout';
import MyBroadcasts from './pages/MyBroadcasts';
import BroadcastManagement from './pages/BroadcastManagement';
import { ThemeProvider } from './theme/ThemeProvider';
import { DashboardIcon, PeopleIcon, HistoryIcon, TicketIcon, AddIcon } from './components/OptimizedIcons';
import { SupervisorAccount, Assignment, PostAdd, Settings, Email, ChatBubble, Folder, AccountBalanceWallet, MonetizationOn, Analytics } from '@mui/icons-material';
import { Alert as MuiAlert, Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWA } from './hooks/usePWA';
import { usePermissions } from './hooks/usePermissions';
import { MyTickets } from './pages/MyTickets';
import { UserGuideManagement } from './pages/UserGuideManagement';
import { MyUserGuide } from './pages/MyUserGuide';
import DemoPage from './pages/DemoPage';
import { MENU_CONFIG } from './constants/menuConfig.tsx';
import { filterMenuByPermissions } from './utils/menuFilter';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = usePWA();
  const { permissions } = usePermissions();
  
  // Filter menu items based on DB permissions and roles
  const menuItems = filterMenuByPermissions(MENU_CONFIG, user, permissions);
  return (
    <ThemeProvider>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/my-broadcasts"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="My Broadcasts">
                <MyBroadcasts />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/broadcast-management"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Broadcast Management">
                <BroadcastManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Dashboard">
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="User Management">
                <UserManagementTabs />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/auditlogs"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Audit Log Viewer">
                <AuditLogs />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="User Profile">
                <ProfilePage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Ticket Management">
                <TicketManagement />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/create-ticket"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Create Ticket">
                <CreateTicket />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Ticket Details">
                <TicketDetails />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Messages">
                <Messages />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Resource Center">
                <ResourceCenter />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="System Settings">
                <SystemSettings />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="My Wallet">
                <Wallet />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/commission-management"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Commission Management">
                <CommissionManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-commissions"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="My Commissions">
                <MyCommissions />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/wallet-management"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Wallet Management">
                <WalletManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="My Tickets">
                <MyTickets />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-guide-management"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="User Guide Management">
                <UserGuideManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-user-guide"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="My User Guide">
                <MyUserGuide />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/demo"
          element={
            <PrivateRoute>
              <Layout menuItems={menuItems} title="Solution Demo">
                <DemoPage />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
      <OfflineIndicator />
    </ThemeProvider>
  );
};

export default App;