# Incharge Verification – Step-by-Step Guide

This guide explains how incharge verification works and how to use it in your project.

---

## Overview

1. **Incharge** signs up → fills verification form (mobile, experience, certs) → can use incharge dashboard.
2. **Admin** logs in → sees pending incharges → reviews details → clicks **Verify** to approve them.
3. **Verified** incharges have `verified: true` in the database (you can later restrict features to verified incharges only).

---

## Step 1: Create the first admin user

You need at least one user with role `admin` to verify incharges.

### Option A – Using the script (recommended)

1. Open a terminal in the **backend** folder.
2. Run:
   ```bash
   node scripts/createAdmin.js
   ```
   This creates: **admin@greenspace.com** / **admin123** (change these in production).

3. To use your own email and password:
   ```bash
   node scripts/createAdmin.js your@email.com YourSecurePassword
   ```

### Option B – Using MongoDB directly

1. Sign up a normal user from the app (Signup page).
2. Open MongoDB Compass or `mongosh`, connect to your database.
3. Find the `users` collection and set that user’s `role` to `"admin"`.

### Option C – Convert existing user to admin

If you already have a user (e.g. your email):

```bash
cd backend
node scripts/createAdmin.js your@email.com
```

This updates that user to `role: 'admin'` (password unchanged if you only pass email; for a new password pass it as second argument).

---

## Step 2: Log in as admin

1. Start backend and client (see main README).
2. Go to **Login** (or Incharge Login – both work).
3. Log in with the admin email and password.
4. You will be redirected to **/admin** (Admin dashboard).

---

## Step 3: Admin dashboard – verify incharges

1. In the navbar, click **Admin** (only visible when logged in as admin).
2. You will see:
   - **Pending** – incharges who submitted the verification form but are not yet verified.
   - **All incharges** – every incharge (pending + already verified).
3. For each pending incharge you can:
   - **View details** – opens a modal with mobile, experience, region, emergency contact, certifications (with links to open uploaded files).
   - **Verify** – marks that incharge as verified (`verified: true`).
4. After clicking **Verify**, the incharge moves from “Pending” to “Verified” and no longer appears in the Pending list.

---

## Step 4: Incharge flow (for reference)

1. User goes to **Sign up** → chooses **Incharge** → signs up.
2. After signup they are sent to **/incharge/verify**.
3. They fill: mobile, previous experience, region, years of experience, emergency contact, and optionally upload certificates (PDF/DOC/JPG/PNG, max 5 files).
4. They click **Submit verification** → redirected to **/incharge/dashboard**.
5. Their record is saved with `verificationSubmitted: true` and `verified: false`.
6. Admin later logs in → goes to Admin → sees this incharge under **Pending** → reviews → clicks **Verify**.
7. Incharge record is updated to `verified: true`.

---

## Step 5: Optional – use “verified” in your app

- In the **incharge dashboard**, you can show a banner like “Pending verification” when `verified === false` (call `GET /api/incharges/profile` and check `verified`).
- You can restrict certain incharge actions (e.g. creating drives) to `verified === true` only by checking this in the backend before performing the action.

---

## API summary (admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/incharges?pending=true` | Admin | List pending incharges (verification submitted, not verified). |
| GET | `/api/incharges` | Admin | List all incharges. |
| GET | `/api/incharges/:id` | Admin | Get one incharge (details + certifications). |
| PUT | `/api/incharges/:id/verify` | Admin | Set `verified: true` for that incharge. |

---

## Troubleshooting

- **No “Admin” in navbar** – Make sure the logged-in user has `role: 'admin'` (run the createAdmin script or update in DB).
- **403 Admin access only** – The verify/list endpoints require an admin token; use the same login that redirects to /admin.
- **Certification links don’t open** – Ensure the backend is running and Vite proxy includes `/uploads` (see `client/vite.config.cjs`). Files are stored under `backend/uploads/certificates/`.
