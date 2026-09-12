# Bright and Tidy Cleaning — Booking Website & Admin Dashboard

A premium cleaning-service website with a real online booking system and a secure admin dashboard.
Built with React, TypeScript, Vite, Tailwind CSS and Supabase.

## Features

**Public website**
- Image-led hero, services, how-it-works, about, booking, call-to-action and footer sections
- Services load live from Supabase. Only active services are shown.
- Company name, email, phone and address come from `business_settings`
- Five-step booking flow: choose a service, pick a date and arrival time, describe the space and add photos, enter contact details, see a confirmation
- Available times are calculated from business hours, service duration, slot interval, booking notice, blocked dates and existing appointments
- Same-day booking is blocked, in the app and in the database
- Prices are shown as "starting at" minimums, with the final quote confirmed by phone

**Admin dashboard** (`/admin`)
- Supabase Auth email and password login. Access is granted only when the user's id is in `admin_users.user_id`.
- Overview with upcoming, pending and completed appointments and active services
- Appointments with status filters, search, a details drawer, status changes and team notes
- Services: add, edit, activate and deactivate. Inactive services stay visible in the dashboard only.
- Business hours per weekday, blocked dates, and business settings

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · Framer Motion · lucide-react · date-fns · React Router 6 · Supabase JS v2 · Vitest

## Setup

1. **Install Node.js 20 or newer.** On this machine Node lives in `~/.local/node`, so add it to your PATH first:

   ```bash
   export PATH="$HOME/.local/node/bin:$PATH"
   ```

2. **Install dependencies.**

   ```bash
   npm install
   ```

3. **Add your Supabase credentials.** Edit `.env.local` in the project root (a template is in `.env.example`):

   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
   ```

4. **Create the database.** Open the Supabase dashboard, go to SQL Editor, paste the contents of `supabase/schema.sql` and run it.
   The script is safe to re-run. It creates the tables, row-level security policies and helper functions, and adds starter services, hours and settings when the tables are empty.

5. **Create an admin user.**
   - In Supabase, go to Authentication → Users → Add user, and create a user with an email and password.
   - Copy the user's UUID and run:

     ```sql
     insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE')
     on conflict (user_id) do nothing;
     ```

6. **Start the app.**

   ```bash
   npm run dev
   ```

   The website runs at http://localhost:5173 and the dashboard at http://localhost:5173/admin.

## Services, pricing and the quote call

The site never quotes a final price. Each service shows a starting-at minimum, taken from the company pricing model:

| Service | Starting at | Booked duration |
| --- | --- | --- |
| Standard Cleaning | $175 | 2 hr |
| Deep Cleaning | $375 | 4 hr |
| Move-In / Move-Out Cleaning | $425 | 5 hr |
| Post-Construction Cleaning | $450 | 6 hr |
| Office Cleaning | $70 per visit | 1 hr 30 min |

Step 3 of the booking flow collects what the office needs to quote accurately: property type, square footage, stories, bedrooms and bathrooms, condition, pets and carpet rooms for homes; dust level, window count and whether the trades have finished for post-construction; facility type, restrooms, break rooms and visit frequency for offices.
Customers can also attach photos of their space.

All of it is saved into `appointments.notes` in a readable format and shown in the dashboard, because the appointments table has a fixed schema. Edit prices and durations any time on the dashboard Services page.

## Photos

Photos upload to a private Supabase Storage bucket named `booking-photos`, created by the database script.
Visitors can upload but never read. Admins view them in the appointment drawer through short-lived signed URLs.
The stored paths are kept in a `[photos]` block inside the notes, which the dashboard hides from the text editor and re-attaches when notes are saved.

If storage is not set up, booking still succeeds. The request is marked so the office knows to ask for photos by text.

## How availability works

For the selected day and service, the booking flow in `src/lib/availability.ts` does the following:

1. It skips the day if it appears in `blocked_dates`.
2. It reads the `business_hours` row for that weekday. Weekdays use JavaScript numbering, so 0 is Sunday and 6 is Saturday. Closed or missing days have no times.
3. It steps from opening time in `slot_interval_minutes` increments. Each slot lasts `services.duration_minutes` and must end by closing time.
4. It drops slots that start sooner than `booking_notice_hours` from now, and never offers today. Same-day work is refused because every job is confirmed by phone first. To allow it later, flip `ALLOW_SAME_DAY_BOOKING` in `src/lib/availability.ts` and relax the matching database rule.
5. It drops slots that overlap an existing appointment that is not cancelled. The overlap rule is `new_start < existing_end AND new_end > existing_start`.

Every slot is a `{ start: Date, end: Date, label: string }` object. The appointment is saved with `appointment_date` as `YYYY-MM-DD` and `start_time` / `end_time` as `HH:mm:ss`.

**Privacy.** Visitors can insert appointments but cannot read them, because there is no public SELECT policy on `appointments`.
The booking flow asks the `get_booked_slots(date)` database function for busy windows instead. It returns only start and end times, never names or contact details.
After the insert, the confirmation screen is built from the form data already in the browser.

**Double-booking guard.** An exclusion constraint called `appointments_no_overlap` stops two active appointments from overlapping, even when two people book at the same moment.
If that happens, the customer sees "That time was just booked" and picks another time.

**Server-side booking rules.** A database trigger rejects public inserts that use an inactive service, don't match the service duration, land on a blocked date, or fall outside business hours.
Admins are exempt, so the dashboard can still adjust appointments. The booking notice is enforced in the booking flow.

## Admin access

- On load, the app calls `getSession()`. With no session it shows the login form.
- With a session, it calls `getUser()` and looks up `admin_users` where `user_id` equals the user's id, using `maybeSingle()`.
- A signed-in user without a row sees "You are signed in, but you are not authorized as an admin."
- The verification always finishes and is time-limited, so the screen can't hang on "Verifying access…".
- Temporary network errors never sign anyone out. Only the Sign out button signs out.
- The database enforces the same rule through the `is_admin()` function used by every admin write policy.

## Replacing images

All photos are listed in `src/lib/images.ts`. Change the `src` and `alt` values there to use your own photography.
Service cards pick an image by keywords in the service name, such as "deep", "move", "office" or "apartment". New services added in the dashboard get a matching photo automatically.
If an image fails to load, a branded placeholder keeps the layout intact.

## Project structure

```
src/
  admin/              Admin auth provider, route gate, layout, login and dashboard pages
    components/       Dashboard building blocks (appointments, services, overview, shell)
    pages/            Overview, Appointments, Services, Business hours, Blocked dates, Settings
  components/
    public/           Website sections and the booking flow (booking/)
    ui/               Shared design-system components
  lib/                Supabase client, queries, availability logic, formatting, images, types
  pages/              Home and 404 pages
  styles/globals.css  Design tokens and component classes
supabase/schema.sql   Tables, row-level security, helper functions and starter data
```

## Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Typecheck and build for production |
| `npm run preview`   | Serve the production build      |
| `npm run typecheck` | Run the TypeScript checker      |
| `npm test`          | Run the unit tests              |
