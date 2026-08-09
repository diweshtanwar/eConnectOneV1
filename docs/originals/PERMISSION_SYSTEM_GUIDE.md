# Permission System Guide - DB-Driven with Constants

## System Architecture

**HYBRID APPROACH**: Database-driven permissions + TypeScript constants

### Components:
1. **Database** - RolePermission table (source of truth)
2. **Constants** - Type-safe permission keys
3. **Menu Config** - Centralized menu structure
4. **Filter Utility** - Permission-based filtering

---

## File Structure

```
frontend/src/
├── constants/
│   ├── permissions.ts      # Permission constants
│   └── menuConfig.ts        # Menu structure with permissions
├── utils/
│   └── menuFilter.ts        # Permission filtering logic
├── hooks/
│   └── usePermissions.ts    # Fetch user permissions from DB
└── App.tsx                  # Uses filtered menu
```

---

## How It Works

### 1. Database (Backend)
**Table:** `RolePermissions`
```sql
RoleId | Permission          | CanView | CanCreate | CanEdit | CanDelete
-------|---------------------|---------|-----------|---------|----------
3      | Dashboard           | true    | true      | true    | true
3      | UserManagement      | true    | true      | true    | true
3      | SystemSettings      | true    | true      | true    | true
1      | Dashboard           | true    | false     | false   | false
1      | UserManagement      | true    | true      | true    | false
```

### 2. Constants (Frontend)
**File:** `constants/permissions.ts`
```typescript
export const PERMISSIONS = {
  DASHBOARD: 'Dashboard',
  USER_MANAGEMENT: 'UserManagement',
  SYSTEM_SETTINGS: 'SystemSettings',
  // ... matches DB Permission field
} as const;
```

### 3. Menu Configuration
**File:** `constants/menuConfig.ts`
```typescript
export const MENU_CONFIG: MenuItem[] = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard', 
    permission: PERMISSIONS.DASHBOARD  // DB-driven
  },
  { 
    text: 'System Settings', 
    icon: <Settings />, 
    path: '/settings', 
    permission: PERMISSIONS.SYSTEM_SETTINGS  // Only Master Admin has CanView=true
  },
  { 
    text: 'My Wallet', 
    icon: <AccountBalanceWallet />, 
    path: '/wallet', 
    roles: ['CSP']  // Fallback: role-based (no DB permission)
  },
];
```

### 4. Permission Filtering
**File:** `utils/menuFilter.ts`
```typescript
export const filterMenuByPermissions = (menuItems, user, permissions) => {
  return menuItems.filter(item => {
    // Check DB permission first
    if (item.permission) {
      return permissions[item.permission]?.canView === true;
    }
    // Fallback to role check
    if (item.roles) {
      return item.roles.includes(user.role.name);
    }
    return true;
  });
};
```

---

## Adding New Menu Items

### Option 1: DB-Driven (Recommended)

**Step 1:** Add permission to database
```sql
INSERT INTO RolePermissions (RoleId, Permission, CanView, CanCreate, CanEdit, CanDelete)
VALUES (3, 'Reports', true, true, true, true);  -- Master Admin
```

**Step 2:** Add constant
```typescript
// constants/permissions.ts
export const PERMISSIONS = {
  // ... existing
  REPORTS: 'Reports',  // Must match DB
};
```

**Step 3:** Add to menu config
```typescript
// constants/menuConfig.ts
{ 
  text: 'Reports', 
  icon: <Assessment />, 
  path: '/reports', 
  permission: PERMISSIONS.REPORTS 
}
```

### Option 2: Role-Based (Simple)

```typescript
// constants/menuConfig.ts
{ 
  text: 'My Profile', 
  icon: <Person />, 
  path: '/profile', 
  roles: ['Master Admin', 'Admin', 'HO user', 'CSP']  // All roles
}
```

---

## Modifying Access

### Change Who Can See a Menu

**Database Update:**
```sql
-- Give Admin access to SystemSettings
INSERT INTO RolePermissions (RoleId, Permission, CanView, CanCreate, CanEdit, CanDelete)
VALUES (1, 'SystemSettings', true, false, false, false);

-- Remove HO user access to TicketManagement
UPDATE RolePermissions 
SET CanView = false 
WHERE RoleId = 2 AND Permission = 'TicketManagement';
```

**No code changes needed!** Menu updates automatically.

### Change Role-Based Menu

```typescript
// constants/menuConfig.ts
{ 
  text: 'My Wallet', 
  roles: ['CSP', 'Admin']  // Add Admin
}
```

---

## Permission Checking in Pages

### Check View Permission
```typescript
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../constants/permissions';

const MyPage = () => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(PERMISSIONS.USER_MANAGEMENT, 'view')) {
    return <AccessDenied />;
  }
  
  return <div>Content</div>;
};
```

### Check Action Permission
```typescript
const canEdit = hasPermission(PERMISSIONS.USER_MANAGEMENT, 'edit');
const canDelete = hasPermission(PERMISSIONS.USER_MANAGEMENT, 'delete');

<Button disabled={!canEdit}>Edit</Button>
<Button disabled={!canDelete}>Delete</Button>
```

---

## Benefits of This System

✅ **DB-Driven**: Change permissions without code deployment
✅ **Type-Safe**: TypeScript constants prevent typos
✅ **Centralized**: Single menu configuration
✅ **Flexible**: Mix DB permissions + role-based
✅ **Maintainable**: Clear separation of concerns
✅ **Scalable**: Easy to add new permissions

---

## Current Permission Mapping

| Permission Constant | DB Field | Pages |
|---------------------|----------|-------|
| DASHBOARD | Dashboard | /dashboard |
| USER_MANAGEMENT | UserManagement | /users |
| TICKET_MANAGEMENT | TicketManagement | /tickets |
| AUDIT_LOGS | AuditLogs | /auditlogs |
| SYSTEM_SETTINGS | SystemSettings | /settings |
| BROADCAST_MANAGEMENT | BroadcastManagement | /broadcast-management |
| COMMISSION_MANAGEMENT | CommissionManagement | /commission-management |

---

## Troubleshooting

**Menu not showing?**
1. Check DB: `SELECT * FROM RolePermissions WHERE RoleId = X AND Permission = 'Y'`
2. Verify `CanView = true`
3. Check constant matches DB field exactly
4. Clear browser cache and re-login

**Permission not working?**
1. Verify API returns permissions: Check Network tab
2. Check `usePermissions` hook is called
3. Ensure permission constant is correct

---

## Best Practices

1. **Always use constants** - Never hardcode permission strings
2. **DB for core features** - Use DB permissions for main modules
3. **Roles for simple items** - Use role-based for profile, help, etc.
4. **Test all roles** - Create test users for each role
5. **Document changes** - Update this guide when adding permissions
