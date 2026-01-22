# Invitation System API Testing with curl

This document contains curl commands to test the invitation system endpoints.

## Prerequisites

1. Backend must be running on `http://localhost:8080`
2. You need a registered user and authentication token
3. You need a building with at least one unit
4. Email configuration must be set up in `.env` file

## Environment Setup

```bash
# Base URL
BASE_URL="http://localhost:8080/api"

# You'll need to replace these with actual values after logging in
AUTH_TOKEN="your-jwt-token-here"
UNIT_ID="1"
```

## 1. Register a User (Manager/Resident)

```bash
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "rememberMe": false
  }'
```

**Response:** Returns JWT token and user details.

---

## 2. Login

```bash
curl -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123",
    "rememberMe": false
  }'
```

**Response:** Returns JWT token. Save this token for subsequent requests.

---

## 3. Create an Invitation

Send an invitation to a guest for a specific unit.

```bash
curl -X POST "${BASE_URL}/invitations" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=${AUTH_TOKEN}" \
  -d '{
    "unitId": 1,
    "inviteeEmail": "guest@example.com"
  }'
```

**Response:**
```json
{
  "id": 1,
  "inviteeEmail": "guest@example.com",
  "invitationCode": "ABC12345",
  "status": "PENDING",
  "expiresAt": "2026-01-29T12:00:00Z",
  "createdAt": "2026-01-22T12:00:00Z",
  "acceptedAt": null,
  "unitInfo": {
    "id": 1,
    "unitNumber": 101,
    "buildingName": "Building A"
  },
  "createdByInfo": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

The guest will receive an email with the invitation code.

---

## 4. Validate an Invitation

Before registering or logging in, validate the invitation code.

```bash
curl -X POST "${BASE_URL}/invitations/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "invitationCode": "ABC12345",
    "email": "guest@example.com"
  }'
```

**Response:** Returns invitation details if valid, or error if expired/invalid.

---

## 5. Register with Invitation Code (For Non-Registered Users)

Guest registers a new account using the invitation code.

```bash
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "guest@example.com",
    "password": "guestpass123",
    "rememberMe": false,
    "invitationCode": "ABC12345"
  }'
```

**Response:** Returns JWT token and user details. The invitation is automatically accepted.

---

## 6. Login with Invitation Code (For Registered Users)

If the guest already has an account, they can login with the invitation code.

```bash
curl -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@example.com",
    "password": "guestpass123",
    "rememberMe": false,
    "invitationCode": "ABC12345"
  }'
```

**Response:** Returns JWT token. The invitation is automatically accepted.

---

## 7. Manually Accept an Invitation

Alternative way to accept an invitation (if not using register/login with code).

```bash
curl -X POST "${BASE_URL}/invitations/ABC12345/accept" \
  -H "Cookie: accessToken=${AUTH_TOKEN}"
```

**Response:** Returns updated invitation with status ACCEPTED.

---

## 8. Get My Pending Invitations

Check all pending invitations for the current user's email.

```bash
curl -X GET "${BASE_URL}/invitations/my-pending" \
  -H "Cookie: accessToken=${AUTH_TOKEN}"
```

**Response:** Returns array of pending invitations.

---

## 9. Get Invitations by Unit

Get all invitations for a specific unit (for managers/unit owners).

```bash
curl -X GET "${BASE_URL}/invitations/unit/1" \
  -H "Cookie: accessToken=${AUTH_TOKEN}"
```

**Response:** Returns array of all invitations for the unit.

---

## 10. Revoke an Invitation

Revoke a pending invitation (managers/creators can revoke).

```bash
curl -X DELETE "${BASE_URL}/invitations/1" \
  -H "Cookie: accessToken=${AUTH_TOKEN}"
```

**Response:** 204 No Content on success.

---

## Complete Workflow Example

### Scenario: Manager invites a guest to their apartment

```bash
# Step 1: Manager logs in
MANAGER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "managerpass"
  }')

echo "Manager logged in: $MANAGER_RESPONSE"

# Step 2: Manager creates invitation for guest
INVITATION_RESPONSE=$(curl -s -X POST "${BASE_URL}/invitations" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=${AUTH_TOKEN}" \
  -d '{
    "unitId": 1,
    "inviteeEmail": "newguest@example.com"
  }')

echo "Invitation created: $INVITATION_RESPONSE"

# Extract invitation code from response (requires jq)
INVITATION_CODE=$(echo $INVITATION_RESPONSE | jq -r '.invitationCode')
echo "Invitation Code: $INVITATION_CODE"

# Step 3: Guest validates the invitation
curl -X POST "${BASE_URL}/invitations/validate" \
  -H "Content-Type: application/json" \
  -d "{
    \"invitationCode\": \"$INVITATION_CODE\",
    \"email\": \"newguest@example.com\"
  }"

# Step 4: Guest registers with invitation code
GUEST_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"New\",
    \"lastName\": \"Guest\",
    \"email\": \"newguest@example.com\",
    \"password\": \"guestpass123\",
    \"rememberMe\": false,
    \"invitationCode\": \"$INVITATION_CODE\"
  }")

echo "Guest registered: $GUEST_RESPONSE"
```

---

## Error Scenarios

### Invalid Invitation Code
```bash
curl -X POST "${BASE_URL}/invitations/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "invitationCode": "INVALID",
    "email": "guest@example.com"
  }'
```

**Response:** 404 Not Found - "Invalid invitation code or email"

### Expired Invitation
Invitations expire after 7 days automatically.

### Wrong Email
```bash
curl -X POST "${BASE_URL}/invitations/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "invitationCode": "ABC12345",
    "email": "wrongemail@example.com"
  }'
```

**Response:** 404 Not Found - "Invalid invitation code or email"

### Already Accepted Invitation
```bash
# Try to accept the same invitation twice
curl -X POST "${BASE_URL}/invitations/ABC12345/accept" \
  -H "Cookie: accessToken=${AUTH_TOKEN}"
```

**Response:** 400 Bad Request - "Invitation has already been accepted"

---

## Notes

1. **Email Configuration**: Make sure to configure email settings in `.env`:
   ```
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_FROM=noreply@smartentrance.com
   ```

2. **Invitation Code**: The invitation code is the apartment's access code, so multiple invitations to the same apartment will have the same code but different emails.

3. **Expiration**: Invitations automatically expire after 7 days. A scheduled task runs daily at 3 AM to mark expired invitations.

4. **Security**: Invitations are validated using both the code AND the invitee's email to prevent unauthorized access.

5. **Authentication**: Most endpoints require authentication via JWT token in the `accessToken` cookie.
