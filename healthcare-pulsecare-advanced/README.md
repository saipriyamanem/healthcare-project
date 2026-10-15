# PulseCare – Practical Healthcare Appointment System

## What was improved

### Patient experience
- **Doctor availability waitlist:** if a doctor is unavailable, a patient can select **Notify me when available**.
- **Automatic availability alert:** when a doctor changes from Unavailable → Available, waiting patients receive a persistent in-app notification.
- **Browser notifications:** patients can enable browser alerts for appointment updates and availability.
- **Appointment notifications:** doctors receive new-request alerts; patients receive confirmation, decline and completion alerts.
- **Upcoming appointment banner:** confirmed appointments are surfaced at the top of the dashboard.
- **Waitlist management:** patients can see doctors they are waiting for and remove themselves.
- **Safer booking validation:** past dates, doctor's working days, unavailable doctors and invalid time slots are rejected by the backend.
- **Conflict protection:** the backend prevents two active appointments from taking the same doctor/time slot.

### Doctor experience
- **Live-ish dashboard refresh:** appointment and notification data refreshes automatically every 12 seconds.
- **Browser alerts for new requests:** doctors can enable browser notifications.
- **Availability control:** changing Unavailable → Available automatically notifies patients on that doctor's waitlist.
- **Notification count / toast feedback:** doctors can immediately see important request updates.

### Technical improvements
- MongoDB-backed `Notification` collection.
- MongoDB-backed `Waitlist` collection.
- REST APIs for notifications and waitlists.
- Configurable `MONGODB_URI`, `PORT`, `JWT_SECRET`, and frontend API URL.
- Root `npm start` launches frontend + backend together.
- Windows `start.bat` provides one-click startup after dependencies are installed.

## Requirements
- Node.js LTS
- MongoDB running locally at `mongodb://127.0.0.1:27017/healthcare`
- A modern browser

## Run

### Easiest on Windows
Double-click `start.bat`.

### Manual
From the project root:

```bash
npm install
npm run install-all
npm start
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

If MongoDB is not running, start MongoDB first.

## Demo doctors
The backend seeds demo doctors automatically on startup.

Example:
- Email: `priya@pulsecare.com`
- Password: `doctor123`

The same password applies to the seeded demo doctors.

## Important demo flow: doctor availability alert

1. Create/login as a patient.
2. Open **Find a doctor**.
3. If a doctor is unavailable, click **Notify me when available**.
4. Login as that doctor in another browser/incognito window.
5. Change doctor availability from **Unavailable** to **Available**.
6. The backend creates a notification for every waiting patient.
7. The patient dashboard polls for the new notification and can show a browser alert if notifications are enabled.
8. The patient can then return to the doctor directory and book an available slot.

## Production next steps
For a real deployment, add HTTPS, secure cookies/rotating JWTs, rate limiting, email/SMS/WhatsApp provider integration, audit logs, proper role administration, appointment slot locking/transactions, encrypted secrets, backups, monitoring, and healthcare/privacy compliance appropriate to the deployment jurisdiction.
