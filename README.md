# Where Did I Park? | Smart Two-Wheeler Parking Management System

**Where Did I Park?** is a production-minded web application engineered specifically for motorcycles, scooters, and electric two-wheelers in India. It connects three core operational modules:

1. **Parking Discovery**: Interactive OpenStreetMap (Leaflet) discovery with India-aware geolocation, dynamic city and price filtering, and system-recorded slot availability.
2. **Parking Allocation**: Atomic concurrency-safe slot allocation preventing double bookings, vehicle registration, and digital QR parking tickets.
3. **Vehicle Retrieval & Security**: Live session tracking, exact slot and zone navigation, authorized departure checkout, and security incident reporting with administrative resolution workflows.

---

## Technology Stack

- **Framework**: Next.js 15 (App Router, JavaScript/React JSX)
- **Styling**: Tailwind CSS with custom Deep Teal palette (`#176B5B`), status indicators, and Inter typography
- **Database & ODM**: MongoDB & Mongoose
- **Authentication**: JWT-based session management using `jose` with secure HTTP-only cookies and `bcryptjs` password hashing
- **Validation**: Zod input validation schemas
- **Mapping**: Leaflet and OpenStreetMap (India-first default bias)
- **Digital Tickets**: `qrcode.react` SVG barcode generation
- **Analytics**: Recharts for facility occupancy, daily entries/exits, and incident reports
- **Icons**: Lucide React SVG icons (no emoji icons in UI)

---

## Prerequisites

- **Node.js**: v18.17.0+ or v20+ (tested on Node v24)
- **npm**: v9+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/where_did_i_park`) or MongoDB Atlas URI

---

## Getting Started

### 1. Installation

Clone or open the repository workspace and install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/where_did_i_park
AUTH_SECRET=where_did_i_park_production_grade_secret_key_32_characters_minimum
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed Demo Data

Run the database seed script to populate sample parking facilities (New Delhi, Bengaluru, Mumbai, Pune), numbered zones and slots, rider vehicles, active sessions, and an administrator account:

```bash
npm run seed
```

#### Demo Accounts Created:
- **Administrator**: `admin@example.com` / `Admin@1234` (Access to `/admin`)
- **Rider User**: `rider@example.com` / `Rider@1234` (Access to `/dashboard`)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Application Routes

### Public Pages
- `/`: Landing page with 3-module breakdown, live bay search, and quick access.
- `/login`: Rider and administrator authentication with demo account quick-fill.
- `/register`: Account registration with Indian phone number validation.
- `/parking`: Parking lot discovery with interactive Leaflet map and filters.
- `/parking/[lotId]`: Parking lot details, live zone slot grid, and direct slot allocation.

### Rider Dashboard Pages
- `/dashboard`: Overview of active sessions, registered vehicles, and recent activity.
- `/dashboard/find-parking`: In-dashboard discovery and slot reservation.
- `/dashboard/my-parking`: Live active session with exact slot, map directions, digital QR ticket, and authorized checkout.
- `/dashboard/vehicle`: Two-wheeler vehicle registration (motorcycles, scooters, electric bikes) with format validation.
- `/dashboard/history`: Completed parking sessions, duration, and fee receipts in Indian Rupees (₹).
- `/dashboard/incidents`: Submit security or parking violation reports and inspect administrator resolution notes.
- `/dashboard/profile`: Account details and role level.

### Administrator Pages
- `/admin`: Facility analytics with live summary statistics and Recharts activity graphs.
- `/admin/lots`: Manage parking facilities, toggle active/inactive status, and pricing in ₹.
- `/admin/lots/new`: Create a new parking facility with auto-generated zone slots.
- `/admin/lots/[lotId]`: Edit facility parameters and address.
- `/admin/slots`: Real-time slot management (Available, Occupied, Reserved, Blocked) with concurrency safeguard.
- `/admin/sessions`: Audit all active and completed sessions with ticket identifiers.
- `/admin/users`: Registered rider database with vehicle and session counts.
- `/admin/incidents`: Incident review queue to update statuses and record resolution notes.
- `/admin/reports`: Date-filtered audit reports with one-click CSV export.

---

## Architectural Safeguards & Non-Negotiable Rules

1. **Atomic Concurrency Protection**:
   - Slot allocation executes via atomic conditional update:
     `ParkingSlot.findOneAndUpdate({ _id: slotId, status: 'available' }, { $set: { status: 'occupied' } })`.
   - Prevents race conditions and double-bookings.
2. **Administrator Override Protection**:
   - An administrator cannot accidentally mark an occupied slot as available if an active session occupies it. The session must be completed first.
3. **Vehicle Constraints**:
   - A vehicle cannot be deleted while actively parked.
   - A vehicle cannot be placed in two active parking sessions simultaneously.
4. **India-First Location Policy**:
   - Geolocation search defaults to India (`countrycodes=in`) with coordinates dynamically biased toward local viewports.
5. **Design & Copy Standards**:
   - Primary Deep Teal `#176B5B` palette.
   - Button border-radius between 8px and 12px (no pill shapes).
   - No emoji icons in the UI. All icons use SVG Lucide React.
   - No purple gradients, em dashes, or exaggerated marketing claims.
   - Accurate pricing in Indian Rupees (₹).
