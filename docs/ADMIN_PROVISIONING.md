# Admin Provisioning Guide

## Initial Admin Setup

The system supports **one initial super admin** created via API. After that, additional admins are managed through the admin dashboard.

### Method 1: API Provisioning (First Admin Only)

```bash
# Provision first admin via API
curl -X POST https://your-domain.com/api/auth/provision \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@your-domain.com",
    "password": "SecurePassword123!"
  }'
```

**Response (success):**
```json
{
  "success": true,
  "adminId": "uuid-here"
}
```

**Response (already exists):**
```json
{
  "success": false,
  "error": "Admin sudah tersedia. Gunakan fitur manajemen admin."
}
```

### Method 2: Database Direct Insert (Emergency)

```sql
-- Hash password first (bcrypt, 12 rounds)
-- Use: npm run hash-password -- "your-password"
-- Or online bcrypt generator with cost 12

INSERT INTO admin_users (id, name, email, password_hash, role, is_active)
VALUES (
  UUID(),
  'Super Admin',
  'admin@your-domain.com',
  '$2a$12$hashedpasswordhere',
  'super_admin',
  TRUE
);
```

## Admin Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access + manage admins |
| `admin` | Full CMS access, no admin management |
| `editor` | Content CRUD only, no settings/media |

## Managing Admins (After First Login)

1. Login to `/admin`
2. Navigate to **Settings** → **Admin Management** (if implemented)
3. Or use database directly:

```sql
-- List all admins
SELECT id, name, email, role, is_active, last_login_at, created_at
FROM admin_users;

-- Create new admin
INSERT INTO admin_users (id, name, email, password_hash, role, is_active)
VALUES (UUID(), 'Editor Name', 'editor@domain.com', '$2a$12$hash', 'editor', TRUE);

-- Deactivate admin
UPDATE admin_users SET is_active = FALSE WHERE email = 'editor@domain.com';

-- Change role
UPDATE admin_users SET role = 'admin' WHERE email = 'editor@domain.com';

-- Reset password (hash new password first)
UPDATE admin_users SET password_hash = '$2a$12$newhash' WHERE email = 'editor@domain.com';
```

## Password Requirements

- Minimum 8 characters
- bcrypt with 12 rounds
- Stored as hash only (never plain text)

## Session Management

- **Duration**: 7 days (configurable via `SESSION_DURATION_MS`)
- **Storage**: Database table `admin_sessions`
- **One session per admin**: New login invalidates old sessions
- **Auto-cleanup**: Expired sessions removed on verification

### Force Logout All Sessions

```sql
-- Delete all sessions for specific admin
DELETE FROM admin_sessions WHERE admin_id = 'admin-uuid';

-- Delete all sessions (force everyone to re-login)
TRUNCATE TABLE admin_sessions;
```

## Security Best Practices

1. **Use strong passwords** (16+ chars, mixed case, numbers, symbols)
2. **Rotate passwords** quarterly
3. **Deactivate unused accounts** immediately
4. **Monitor login activity**:
   ```sql
   SELECT u.email, u.last_login_at, s.created_at as session_start
   FROM admin_users u
   LEFT JOIN admin_sessions s ON u.id = s.admin_id
   WHERE s.expires_at > NOW()
   ORDER BY u.last_login_at DESC;
   ```
5. **Use HTTPS only** in production (Secure cookie flag)
6. **Limit admin access** by IP if possible (Nginx allow/deny)

## Troubleshooting

### Forgot Admin Password

```bash
# Option 1: Database reset (requires DB access)
# Generate new hash:
node -e "console.log(require('bcryptjs').hashSync('NewPass123!', 12))"

# Update in DB:
UPDATE admin_users SET password_hash = '$2a$12$newhash' WHERE email = 'admin@domain.com';

# Option 2: If no admins exist, re-provision (only works if admin_count = 0)
curl -X POST https://your-domain.com/api/auth/provision \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@domain.com","password":"NewPass123!"}'
```

### Session Issues

```bash
# Clear all sessions
mysql -u gensa_user -p gensa_db -e "TRUNCATE TABLE admin_sessions;"

# Check session table
mysql -u gensa_user -p gensa_db -e "SELECT * FROM admin_sessions;"
```

### Account Locked (Too Many Failed Attempts)

The system doesn't implement lockout by default. If needed, add to `auth.service.ts`:
- Track failed attempts in `admin_users`
- Lock after 5 failures for 15 minutes
- Notify super_admin