# Event Approval Workflow Implementation

## Plan Overview
Enhance event approval: HOD submits → Admin approves/rejects → Notify HOD → Approved events visible in StudentPortal (already works).

**Status: 0/5 steps complete**

## Steps
1. **[PENDING]** Create TODO.md with steps (current).
2. **[COMPLETE]** Edit FakeAppContext.tsx: Enhance `updateEventStatus` to post HOD-targeted notification.
3. **[COMPLETE]** Edit AdminDashboard.tsx: Pass `event.requested_by` to `updateEventStatus`.
4. **[PENDING]** Test workflow: HOD login → submit event → Admin approve → Verify HOD notification.
5. **[PENDING]** attempt_completion: Workflow complete.

**Next: Proceed to Step 2?**

