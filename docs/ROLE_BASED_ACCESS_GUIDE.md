# Role-Based Access Control Guide

## Overview
This guide explains how to manage role-based menu visibility and page access in eConnectOne.

---

## Key Files

### 1. **App.tsx** (Main Configuration)
**Location:** `frontend/src/App.tsx`

This file controls which menu items are visible to each role.

#### Menu Item Structure:
```typescript
{
  text: 'Menu Name',
  icon: <IconComponent />,
  path: '/route-path',
  roles: ['Master Admin', 'Admin', 'HO user', 'CSP']  // Roles that can see this menu
}
```

#### Current Role Configuration:

| Menu Item | Master Admin | Admin | HO user | CSP |
|-----------|--------------|-------|---------|-----|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ❌ | ❌ |
| Broadcast Management | ✅ | ✅ | ❌ | ❌ |
| Commission Management | ✅ | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |
| Ticket Management | ✅ | ✅ | ✅ | ❌ |
| My Broadcasts | ✅ | ✅ | ✅ | ✅ |
| Messages | ✅ | ✅ | ✅ | ✅ |
| Resource Center | ✅ | ✅ | ✅ | ✅ |
| Create Ticket | ✅ | ✅ | ✅ | ✅ |
| My Wallet | ❌ | ❌ | ❌ | ✅ |
| My Tickets | ✅ | ✅ | ✅ | ✅ |
| My Commissions | ❌ | ❌ | ❌ | ✅ |
| User Guide Management | ✅ | ✅ | ❌ | ❌ |
| My User Guide | ✅ | ✅ | ✅ | ✅ |
| Demo | ✅ | ✅ | ✅ | ✅ |

---

## How to Modify Access

### Add a New Menu Item
In `App.tsx`, add to the `allMenuItems` array:

```typescript
{
  text: 'New Feature',
  icon: <NewIcon />,
  path: '/new-feature',
  roles: ['Master Admin', 'Admin']  // Only these roles can see it
}
```

### Change Role Access for Existing Menu
Find the menu item in `allMenuItems` and modify the `roles` array:

```typescript
// Before: Only Master Admin can see System Settings
{ text: 'System Settings', icon: <Settings />, path: '/settings', roles: ['Master Admin'] }

// After: Master Admin and Admin can see System Settings
{ text: 'System Settings', icon: <Settings />, path: '/settings', roles: ['Master Admin', 'Admin'] }
```

### Remove Access for a Role
Remove the role name from the `roles` array:

```typescript
// Remove HO user access from Ticket Management
{ text: 'Ticket Management', icon: <Assignment />, path: '/tickets', roles: ['Master Admin', 'Admin'] }
```

---

## Backend Role Permissions

### Database Configuration
**Location:** `backend/eConnectOne.API/Data/ApplicationDbContext.cs`

Roles are seeded in the database:
```csharp
new Role { Id = 1, Name = "Admin", IsDeleted = false },
new Role { Id = 2, Name = "HO user", IsDeleted = false },
new Role { Id = 3, Name = "Master Admin", IsDeleted = false },
new Role { Id = 4, Name = "CSP", IsDeleted = false }
```

### Permission System
The `RolePermission` table controls CRUD operations:
- `CanView` - Can view the module
- `CanCreate` - Can create new records
- `CanEdit` - Can edit existing records
- `CanDelete` - Can delete records

---

## Testing Role Access

1. **Create test users** with different roles
2. **Login** with each user
3. **Verify** that only authorized menu items appear
4. **Test navigation** to restricted pages (should redirect or show error)

---

## Important Notes

⚠️ **Security:**
- Frontend menu hiding is for UX only
- Always implement backend API authorization
- Use `[Authorize(Roles = "Master Admin")]` on API controllers

⚠️ **Role Names:**
- Must match exactly between frontend and backend
- Case-sensitive: "Master Admin" ≠ "master admin"

⚠️ **After Changes:**
- Clear browser cache
- Re-login to refresh user data
- Test with multiple role accounts

---

## Quick Reference

### Role Hierarchy (Most to Least Privileged)
1. **Master Admin** - Full system access
2. **Admin** - Management access (no system settings)
3. **HO user** - Operational access (tickets, broadcasts)
4. **CSP** - Customer service point (limited access)

### Common Scenarios

**Scenario 1: Hide System Settings from Admin**
✅ Already configured - only Master Admin can see it

**Scenario 2: Give HO user access to Commission Management**
```typescript
{ text: 'Commission Management', icon: <MonetizationOn />, path: '/commission-management', 
  roles: ['Master Admin', 'Admin', 'HO user'] }
```

**Scenario 3: Create Admin-only Reports page**
```typescript
{ text: 'Reports', icon: <Assessment />, path: '/reports', 
  roles: ['Master Admin', 'Admin'] }
```

---

## Support

For questions or issues with role-based access:
1. Check this guide first
2. Review `App.tsx` menu configuration
3. Verify backend role permissions in database
4. Test with different user accounts
