# Production Test Verification Checklist

This matrix covers end-to-end verification of all application features, authentication flows, roles, email OTPs, database interactions, and routing once deployed to Vercel.

---

| # | Test Scenario | Description / Procedure | Expected Result | Status |
| :-: | :--- | :--- | :--- | :-: |
| 1 | **Frontend Load** | Navigate to production Vercel frontend URL. | Application landing page renders instantly without visual flaws. | [ ] |
| 2 | **Backend Health Check** | Send GET request to `https://<backend-url>/`. | Returns `{ "success": true, "message": "Event Management System API is running" }`. | [ ] |
| 3 | **MongoDB Atlas Connection** | Trigger any API endpoint interacting with DB. | Database queries execute cleanly without connection timeout or cold-start error. | [ ] |
| 4 | **User Registration** | Complete User sign-up form. | Form submits successfully; user redirected to OTP verification screen. | [ ] |
| 5 | **User Gmail OTP** | Inspect inbox of email used for User registration. | Verification email received from Gmail SMTP containing 6-digit OTP. | [ ] |
| 6 | **User OTP Verification** | Input received OTP on verification page. | Account verified; user allowed to proceed to login. | [ ] |
| 7 | **User Login** | Login with verified User credentials. | JWT token issued; user redirected to User Dashboard. | [ ] |
| 8 | **Organizer Registration** | Complete Organizer sign-up form. | Form submits; redirected to OTP verification screen. | [ ] |
| 9 | **Organizer Gmail OTP** | Inspect inbox of Organizer email. | Verification email received from Gmail SMTP containing OTP. | [ ] |
| 10 | **Organizer OTP Verification** | Submit OTP for Organizer account. | Account verified successfully. | [ ] |
| 11 | **Organizer Login** | Login with Organizer credentials. | JWT token issued; redirected to Organizer Dashboard. | [ ] |
| 12 | **Forgot Password Request** | Click "Forgot Password" and submit account email. | System processes request without exposing user existence errors. | [ ] |
| 13 | **Gmail Reset OTP** | Check email inbox for password reset request. | Password reset email received from Gmail SMTP with OTP. | [ ] |
| 14 | **Password Reset Execution** | Enter reset OTP and new password. | Password updated successfully; user can log in with new password. | [ ] |
| 15 | **Event Creation** | As Organizer, create a new event with details, date, and venue. | Event created and displayed in Organizer Dashboard and public event list. | [ ] |
| 16 | **Join Request** | As User, submit a Join Request for an event. | Request recorded with pending status. | [ ] |
| 17 | **Organizer Approval** | As Organizer, view join requests and approve User. | Request status updates to approved. | [ ] |
| 18 | **Coordinator Assignment** | Verify User transition to Coordinator for approved event. | User elevated to event Coordinator view; Organizer can assign tasks. | [ ] |
| 19 | **Task Assignment** | As Organizer, assign a task to the event Coordinator. | Task appears in Coordinator's assigned task list. | [ ] |
| 20 | **Task Submission** | As Coordinator/User, complete task and submit remarks. | Task status updates to "Submitted / Pending Verification". | [ ] |
| 21 | **Task Verification** | As Organizer, verify and approve submitted task. | Task status updates to "Completed / Verified". | [ ] |
| 22 | **Notifications** | Check notifications tab for User and Organizer. | In-app notifications generated for join requests, approvals, and task updates. | [ ] |
| 23 | **Socket.IO Realtime** | Verify realtime events or graceful fallback. | Realtime updates triggered or handled gracefully via fallback without app crashes. | [ ] |
| 24 | **Admin Login** | Log in with Admin credentials (`pulakalasriram@gmail.com`). | JWT token issued; redirected to Admin Dashboard. | [ ] |
| 25 | **Admin Dashboard** | View system statistics, organizers, users, and events. | Full system metrics, status controls, and management tables function correctly. | [ ] |
| 26 | **React Route Refresh** | Directly refresh browser on `/login`, `/admin/dashboard`, `/user/events`. | Page reloads cleanly without Vercel 404 error. | [ ] |
| 27 | **Logout** | Click Logout in navbar across any role. | JWT token and user session cleared; redirected to `/login`. | [ ] |
| 28 | **JWT-Protected API Access** | Attempt accessing `/api/admin/organizers` without Bearer token. | API returns `401 Unauthorized`. | [ ] |
| 29 | **CORS Restrictions** | Attempt API call from unauthorized cross-origin client. | CORS blocks request for non-whitelisted origins. | [ ] |
| 30 | **Mobile Responsiveness** | Test application on mobile browser viewports. | Layout adapts dynamically with responsive nav and UI cards. | [ ] |
