# CampusSync Expansion TODO

## Status: In Progress

1. [x] Update src/context/FakeAppContext.tsx:
   - Extend AppUser (department, interests).
   - Define Registration interface.
   - Pre-seed colleges (MIT Thandavapura, MIT Mysore, NIT Surathkal).
   - Update FAKE_USERS with department/interests.
   - Restructure registrations to Registration[].
   - Add functions: getRegistrationsForEvent, toggleCoordinator, updateAttendance.

2. [x] Update src/pages/HODDashboard.tsx:
   - Add Profile Header Card (College + Dept).
   - Add Manage Events section (approved events for college, click to view AttendanceTracker).

3. [x] Create src/components/AttendanceTracker.tsx:
   - Reusable Table for registrations.
   - Columns: student name, phone, semester, coordinator switch, attendance toggle buttons.
   - Real-time summary badges.
   - Mobile-responsive (stack/horizontal scroll).

4. [x] Update src/pages/StudentPortal.tsx:
   - Split events: "Recommended" (interests match) + Upcoming.
   - Coordinator Tools button on cards if is_coordinator → AttendanceTracker modal.
   - Enhanced UI w/ colors, EventCard component.

✅ All features complete!

## Summary:
- ✅ Database: Colleges pre-seeded, Users w/ dept/interests, Registrations w/ coordinator/attendance
- ✅ HOD: Profile header, Manage Events → AttendanceTracker (toggle coord/att)
- ✅ Student: "Recommended" (interests match), Coordinator Tools button → Tracker
- ✅ UI: Shadcn Table/Card/Badge/Switch, 60-30-10 colors (white #F8FAFC, blue #1E3A8A, orange #F97316), mobile-responsive
- ✅ Demo accounts: hod@campus.com & student@campus.com (pass ends w/ 123)

**Test:** `npm run dev` → localhost:5173 → Login Student → See recs + Coordinator Tools on Cultural Night → Toggle att. HOD → Profile + Manage.

CampusSync expansion complete!

Updated when step complete.
