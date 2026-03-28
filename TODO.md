# Campus Connect Feature Implementation TODO

## Approved Plan Steps (Status: [ ] Complete / [x] Pending)

### Phase 1: Core State Updates (FakeAppContext.tsx)
- [x] 1. Add Notification & Certificate interfaces
- [x] 2. Add state arrays & seed initial data
- [x] 3. Add context functions (postNotification, getNotifications, getStudentCertificates, issueCertificate, updateUserCollegeName, updateUserDepartment)
- [x] 4. Export new types/functions

### Phase 2: NotificationBoard Component
- [x] 5. Create src/components/NotificationBoard.tsx
- [x] 6. Implement shared UI (Card/Accordion), role-based post dialog
- [x] 7. Connect to context functions

### Phase 3: Dashboard Updates
- [ ] 8. AdminDashboard.tsx: Add "Platform Settings" tab + form

### Phase 2: NotificationBoard Component
- [ ] 5. Create src/components/NotificationBoard.tsx
- [ ] 6. Implement shared UI (Card/Accordion), role-based post dialog
- [ ] 7. Connect to context functions

### Phase 3: Dashboard Updates
- [ ] 8. AdminDashboard.tsx: Add "Platform Settings" tab + form
- [ ] 9. HODDashboard.tsx: Add "Department Profile" section + input
- [ ] 10. StudentPortal.tsx: Add "My Certificates" tab + past events filter + download
- [ ] 11. Import NotificationBoard into all 3 dashboards (top section)

### Phase 4: Polish & Test
- [ ] 12. Ensure color scheme (60% white, 30% royal blue, 10% orange)
- [ ] 13. Add Lucide icons (Link2, FileText, Download)
- [ ] 14. Test flows: login roles, post/update notifications/certificates
- [ ] 15. Mock PDF download (blob/dataURL)
- [ ] 16. Update this TODO with completions

**Next Action:** Start Phase 1 step-by-step. Run `bun dev` after changes.

