# Where Did I Park? | Design, Copy & Engineering Rules (Non-Negotiable)

## Core Principle

This project must NEVER look or feel like a generic AI-generated application. Every line of copy, every design decision, and every UI element must feel like it was designed by a real product team for real two-wheeler riders and parking administrators.

The product must prioritize usability, accuracy, security, and functional completeness over visual decoration.

Every feature must solve an actual parking problem. Every displayed value must be accurate, every button must work, and every interface must reflect the application's real state.

---

## What to NEVER Do

### Copy / Text

- No vague hero text such as "Park Smarter, Live Better" or "Your Perfect Parking Experience."
- No em dashes (—) in user-facing copy.
- No buzzwords such as "seamless," "effortless," "curated," "handpicked," "discover," or "unlock."
- No meaningless taglines or exaggerated marketing claims.
- No hardcoded fake parking data, vehicle details, slot availability, parking history, or incident records in production views.
- No hardcoded user names or greetings such as "Welcome, Lalit Baghel."
- No "Made with AI" labels anywhere in the interface.
- No fake reviews, testimonials, customer counts, or social proof.
- No fake occupancy percentages, parking statistics, security claims, or fabricated analytics.
- No misleading claims such as "Real-time availability" unless the application actually receives and maintains sufficiently current occupancy updates.
- No claim that vehicles are automatically protected, tracked, or monitored unless the corresponding hardware and services are implemented.
- No unnecessary marketing content inside functional dashboards.

Write copy that explains exactly what a feature does.

Preferred examples:
- "Find available parking"
- "Select a parking lot"
- "No available slots in this lot"
- "Your active parking session"
- "View parking ticket"
- "Return to your parking slot"
- "Report a parking incident"
- "No parking history yet"

Use clear, natural Indian English. Keep labels short and instructions specific.

Use Indian Rupees (₹) for parking fees. Display monetary amounts only when a real pricing rule exists in the database.

### Design

- No purple gradients.
- No pill-shaped CTA buttons or `border-radius: 9999px` on primary actions.
- No emoji icons anywhere in the UI, including parking markers, vehicle cards, navigation, buttons, alerts, or empty states.
- No custom cursor animations or cursor-related JavaScript effects.
- No parallax effects, flying text, excessive scroll animations, or distracting transitions.
- No AI-generated photographs or generic stock-photo hero sections.
- No decorative glassmorphism.
- No floating gradient orbs or blobs.
- No random brand-color changes between pages.
- No excessive shadows, oversized headings, or repetitive card layouts that make the application resemble a generic dashboard template.
- No visual effects that interfere with maps, slot selection, QR scanning, or parking status indicators.

### Technical

- Use Next.js App Router, React.js, TypeScript, Tailwind CSS, MongoDB, and Mongoose.
- Use Next.js Route Handlers for backend APIs unless a separate server is genuinely required.
- Never use `res.send()` to return raw HTML strings from an Express API. Use the correct response mechanism, such as `Response.json()`, `NextResponse.json()`, `res.render()`, or `res.redirect()`, depending on the architecture.
- Do not expose `.ejs` extensions in route URLs.
- Never use an emoji as the favicon.
- Never expose MongoDB credentials, authentication secrets, or private API keys in client-side code.
- Never rely on client-provided user IDs, roles, parking fees, or slot availability without server-side verification.
- Never use in-memory arrays as the production database.
- Never trust a slot's previously displayed availability when creating a new allocation.
- Never allow two active parking sessions to claim the same slot.
- Never mark a slot available while a valid active session still occupies it.
- Never claim that a feature is implemented or tested when it is not.

---

## What to Always Do

### Copy

- Write concise, specific, functional copy.
- Describe the actual feature, action, or status instead of describing a feeling.
- Use Indian Rupees for pricing.
- Use clear parking terminology consistently: parking lot, zone, slot, vehicle, parking session, entry, checkout, and incident.
- Display dates and times using a consistent local-time format.
- Show clear loading, success, error, permission-denied, and empty states.
- Display the last updated time when parking availability may be stale.
- Explain why an action cannot be completed when a slot is unavailable or a session is invalid.
- Use dynamic user information from the authenticated user's profile.
- Never expose another user's private vehicle information or parking history.

### Design

Use a professional, restrained visual identity suited to a real parking management product.

Suggested brand palette:
- Primary: Deep teal `#176B5B`
- Primary hover: `#125448`
- Main background: `#F7F8FA`
- Card background: `#FFFFFF`
- Main text: `#18212F`
- Secondary text: `#667085`
- Borders: `#E4E7EC`
- Available status: Green
- Occupied status: Red
- Reserved status: Amber
- Blocked status: Gray

Define colors centrally using CSS variables or Tailwind theme tokens. Keep the brand colors consistent throughout the application. Status colors must be accompanied by readable text labels.

Typography:
- Use Inter from Google Fonts.
- Maintain a consistent type scale.
- Use readable font sizes, appropriate line heights, and clear visual hierarchy.

Components:
- Buttons: border radius between 8px and 12px.
- Cards: subtle borders, restrained shadows, and consistent spacing.
- Forms: visible labels, accessible validation, and useful error messages.
- Navigation: consistent sidebar navigation on desktop and a usable mobile navigation pattern.
- Maps: clear parking markers, understandable availability indicators, and accessible map controls.
- QR tickets: clear ticket details and a scannable QR code with appropriate contrast.
- Dashboards: prioritize useful information over decoration.

Use Lucide React, Heroicons, or another consistent SVG icon library. Never use emoji as UI icons.

Create a custom SVG favicon using a simple parking-related brand mark. Use a consistent text-based wordmark such as "Where Did I Park?" without emoji.

### Meta / SEO

- Every public page must have a meaningful title and meta description.
- Use consistent page titles in the format "Page Name | Where Did I Park?"
- Examples:
  - "Find Parking | Where Did I Park?"
  - "Parking Details | Where Did I Park?"
  - "My Parking | Where Did I Park?"
  - "Parking History | Where Did I Park?"
  - "Manage Parking Lots | Where Did I Park?"
- Use Next.js Metadata API or `generateMetadata()` as appropriate.
- Use semantic HTML: `header`, `main`, `section`, `article`, `footer`, and `nav`.
- Give meaningful images descriptive alt text.
- Mark decorative images with empty alt text where appropriate.
- Configure private dashboards and account pages appropriately for search engine indexing.
- Include a real footer with Privacy Policy, Terms of Use, and support information where available.
- Do not invent company details, contact information, or legal claims.

### Data

All production data must come from MongoDB through validated backend operations.

This includes:
- User profiles and roles.
- Vehicle registration numbers and vehicle details.
- Parking lot names, addresses, and coordinates.
- Parking zones and slot numbers.
- Total capacity and available capacity.
- Occupied, reserved, and blocked slot counts.
- Active parking sessions and entry timestamps.
- Checkout timestamps and parking history.
- Pricing and parking fee calculations.
- QR ticket identifiers.
- Security incident reports and their statuses.
- Administrator reports and analytics.

Use properly structured Mongoose models with validation, indexes, and relationships.

Store actual vehicle details and parking attributes in the database. Do not invent values in the view.

Development seed data is permitted for testing, but it must be clearly identified as demo data and must not be mixed with production records.

When no data exists, show a meaningful empty state instead of fabricated records.

Calculate available capacity from valid slot records and ensure occupancy updates remain consistent with parking session changes.

---

## Brand

- **Product name:** Where Did I Park?
- **Product category:** Two-Wheeler Parking Management System
- **Primary technology stack:** Next.js, React.js, TypeScript, MongoDB, Mongoose, and Tailwind CSS
- **Primary color:** `#176B5B`
- **Font:** Inter
- **Logo:** Simple text-based wordmark with a clean parking-related SVG mark
- **Icon system:** Lucide React or Heroicons
- **Visual identity:** Practical, trustworthy, organized, and modern

Do not copy the StayNest rose-red brand color. Give this project its own consistent identity.

---

## Core Functional Requirements

The application has three connected modules.

### Module 1: Parking Discovery

- Find parking lots based on the user's location or manually selected location.
- Show parking lot details and database-backed availability.
- Provide map and list views.
- Support location search and relevant filters.
- Show last updated information when appropriate.
- Provide directions to the selected lot.

### Module 2: Parking Allocation

- Register and select a vehicle.
- Allocate an available parking slot.
- Create a persistent parking session.
- Generate a digital parking ticket and QR code.
- Prevent duplicate allocations and conflicting active sessions.
- Update slot occupancy after successful allocation.

### Module 3: Vehicle Retrieval and Security

- Display the user's active parking session.
- Show the correct lot, zone, slot, and vehicle details.
- Save and display the parking location.
- Support authorized checkout and parking history.
- Allow security incident and parking violation reporting.
- Provide administrator review and resolution workflows.

Every module must be connected to the same persistent database and consistent business logic.

---

## Location & Search Unbiased Policy (Non-Negotiable)

### India-First, Dynamically Location-Aware Search

Never permanently bias the project toward the United States or Canada.

Location search, map autocomplete, geocoding, and nearby parking discovery must prioritize the user's actual location and local region.

Use India (`countrycodes=in`) as the default country preference for this project when the user has not explicitly requested another country. This must be a default, not a permanent restriction.

When a user searches for a location such as "Lovely Professional University," "Love," "Agra," "Munnar," or "Kochi," prioritize relevant landmarks, streets, and places in the user's local country and region rather than unrelated towns in the United States or Canada.

Implement the following:

1. Request device geolocation permission only when needed and after explaining its purpose.
2. Use the device's actual coordinates when permission is granted.
3. Support manual location entry when geolocation is unavailable or denied.
4. Dynamically bias search results toward the current coordinates, local region, and active map viewport when supported by the provider.
5. Detect the country using reliable location information when available. Browser locale and timezone may be used as fallback hints, but must not be treated as proof of physical location.
6. Default to India for initial searches when no better location information is available.
7. Allow explicit international destination searches without forcing Indian results.
8. Update the map center and nearby parking results when the selected location changes.
9. Display useful loading, no-results, permission-denied, and service-error states.
10. Debounce autocomplete requests and follow the selected geocoding provider's usage and attribution policies.

Use Leaflet with OpenStreetMap for maps. Select a geocoding service that supports the intended search behavior.

If using Nominatim, comply with its usage policy and rate limits. Do not use the public Nominatim service for autocomplete in a way that violates its policy. If production autocomplete requires another provider, isolate the provider behind a reusable service so it can be changed without rewriting the application.

Never fabricate nearby parking lots or claim that a parking lot is available based on location search alone. Location results identify places; parking availability must come from the application's actual parking data.

---

## Checklist Before Every Feature

1. Does the copy sound like a real human product team wrote it?
2. Are there any emoji being used as icons?
3. Is any production data hardcoded in the view?
4. Does any CTA look like a pill?
5. Are there fake reviews, fake metrics, or fabricated availability counts?
6. Does the page have a proper title and meta description?
7. Does the feature work end to end with MongoDB?
8. Are server-side validation and authorization implemented?
9. Can concurrent requests create duplicate parking allocations?
10. Does the feature handle loading, empty, and error states?
11. Is location search biased toward the user's actual region?
12. Are stale availability values clearly handled?
13. Is the mobile layout usable?
14. Are all actions functional and appropriately tested?
15. Are vehicle information and security records protected?
16. Does the feature accurately describe what the system can and cannot do?

If any answer exposes a problem, fix it before declaring the feature complete.

---

## Final Instruction

Apply these rules to the entire Where Did I Park? codebase, including existing files, all new features, public pages, user dashboards, administrator dashboards, API routes, database models, maps, forms, notifications, and future enhancements.

Inspect existing code before editing. Preserve working functionality, remove fake production data, standardize the design system, and implement missing functionality.

Do not stop after creating a visually appealing interface. The finished product must be functional, secure, database-backed, mobile-friendly, consistent in design, accurate about parking availability, and honest about the capabilities it actually provides.

Before completing any feature, run the applicable checks and report what has actually been tested and what still requires external configuration.
