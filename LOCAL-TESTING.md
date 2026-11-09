# Testing the site on your laptop

No MongoDB account, no Cloudinary, no settings needed.

## Start

```bash
npm run install:all   # first time only
npm run demo          # starts database + API + website
```

The first run downloads MongoDB once (1–2 minutes). When you see the
"Expediva test mode is running" box, open:

- Website: http://localhost:5173
- Admin: http://localhost:5173/admin/login — `admin@expediva.in` / `changeme123`

Press **Ctrl+C** to stop.

## Good to know

- Trips you add are **kept** for next time (stored in `server/.demo-db`).
  Delete that folder to start over with just the 5 sample trips.
- Photos uploaded in admin are saved in `server/uploads` (local testing only).
- Test mode never touches the real (Atlas) database, even if `server/.env` has one.

## What to check

1. Admin → **New trip** → fill it in → **Create trip**.
2. Home page → the trip is in the **Upcoming Trips** carousel and the **Customize** dropdown.
3. Click it → price, countdown, itinerary, inclusions, **Register Now** opens the Google Form.
4. Edit the trip (price, seats, enrollment off) → refresh → the site updates.
5. Set a trip's **Status → Completed** and add gallery photos → it shows under
   **Past Trips** and **More → Gallery**.

If the demo can't start because of the MongoDB download, check your internet
(campus Wi-Fi sometimes blocks it — try a phone hotspot) and run it again.
