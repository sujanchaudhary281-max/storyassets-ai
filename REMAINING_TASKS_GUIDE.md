# Remaining Implementation Guide for StoreAssets AI

## Overview
**Updated**: 18 of 26 tasks completed! Only 8 tasks remaining.

### ✅ Recently Completed (in this session):
- Task #13: Duplicate Screenshot Feature
- Task #14: Search and Filters on Projects Page  
- Task #16: Global Activity History Page

---

## Remaining Tasks (8 of 26)

### Quick Priority Tasks

## Task #15: Add Search and Filters to Dashboard

### Location: Find the image editor component (likely in `src/components/generation/` or `src/app/(dashboard)/projects/[id]/edit/`)

### Implementation:
1. **Add State Management**:
   ```typescript
   const [history, setHistory] = useState<EditorState[]>([])
   const [historyIndex, setHistoryIndex] = useState(-1)
   ```

2. **EditorState Interface**:
   ```typescript
   interface EditorState {
     imageData: string // base64 or URL
     modifications: any // whatever modifications are tracked
     timestamp: number
   }
   ```

3. **Undo/Redo Functions**:
   ```typescript
   function undo() {
     if (historyIndex > 0) {
       setHistoryIndex(historyIndex - 1)
       applyState(history[historyIndex - 1])
     }
   }
   
   function redo() {
     if (historyIndex < history.length - 1) {
       setHistoryIndex(historyIndex + 1)
       applyState(history[historyIndex + 1])
     }
   }
   ```

4. **UI Buttons**:
   - Add to editor toolbar with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
   - Disable when at history boundaries

---

## Task #14: Add Search and Filters to Projects Page

### File: `src/app/(dashboard)/projects/page.tsx`

### Implementation:
1. **Convert to Client Component**:
   ```typescript
   'use client'
   import { useState, useEffect } from 'react'
   ```

2. **Add State**:
   ```typescript
   const [searchQuery, setSearchQuery] = useState('')
   const [categoryFilter, setCategoryFilter] = useState<string>('all')
   const [platformFilter, setPlatformFilter] = useState<string>('all')
   const [projects, setProjects] = useState<Project[]>([])
   ```

3. **Add Filter UI** (before project grid):
   ```tsx
   <div className="flex gap-3 mb-6">
     <Input
       placeholder="Search projects..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="flex-1"
     />
     <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
       <option value="all">All Categories</option>
       {APP_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
     </select>
     <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
       <option value="all">All Platforms</option>
       <option value="ios">iOS</option>
       <option value="android">Android</option>
     </select>
   </div>
   ```

4. **Filter Logic**:
   ```typescript
   const filteredProjects = projects.filter(project => {
     const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase())
     const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
     const matchesPlatform = platformFilter === 'all' || project.platforms.includes(platformFilter)
     return matchesSearch && matchesCategory && matchesPlatform
   })
   ```

---

## Task #15: Add Search and Filters to Dashboard

### File: `src/app/(dashboard)/dashboard/page.tsx` or similar

### Implementation:
Same as Task #14 but apply to the dashboard's recent projects section:
- Rename "Recent Projects" to "Filtered Projects"
- Add search input and filter dropdowns
- Add filter badges showing active filters
- Include date range filter (This Week, This Month, All Time)

---

## Task #16: Create Global Activity History Page

### Files to Create:
1. `src/app/(dashboard)/activity/page.tsx`
2. `src/app/api/activity/route.ts`

### Implementation:

**Page Component**:
```typescript
// Show paginated list of user activities
// Columns: Action, Project, Date, Details
// Filters: Action Type, Date Range, Project
// Search: By project name or action description

interface Activity {
  id: string
  action: string // 'project_created', 'assets_generated', 'asset_deleted', etc.
  projectId?: string
  projectName?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}
```

**API Route**:
```typescript
// GET /api/activity
// Query params: page, limit, action, projectId, startDate, endDate, search
// Returns paginated activity logs from ActivityLog table
```

**Use the ActivityLog Model** (already exists in schema):
- Fetch from `prisma.activityLog`
- Include project relations
- Order by createdAt desc

---

## Task #17: Fix User Profile Image Upload

### Find Profile Settings Page:
Likely in: `src/app/(dashboard)/settings/page.tsx` or `src/app/(dashboard)/profile/page.tsx`

### Steps:
1. **Find the current upload implementation**
2. **Check if API route exists**: `src/app/api/user/profile/image/route.ts`
3. **If route doesn't exist, create it**:
   ```typescript
   // POST endpoint similar to icon upload
   // - Validates image (max 5MB, PNG/JPEG)
   // - Uploads to R2 in users/{userId}/profile-{timestamp}.{ext}
   // - Updates user.image in database
   // - Returns new image URL
   ```

4. **Fix the frontend**:
   ```typescript
   async function handleImageUpload(file: File) {
     const formData = new FormData()
     formData.append('file', file)
     
     const res = await fetch('/api/user/profile/image', {
       method: 'POST',
       body: formData,
     })
     
     const json = await res.json()
     // Update UI with new image URL
   }
   ```

---

## Task #20: Improve Error Handling Throughout the App

### Implementation Strategy:

1. **Create Error Boundary Component**: `src/components/error-boundary.tsx`
   ```typescript
   // Wrap sections with <ErrorBoundary>
   // Show user-friendly error messages
   // Log errors to console/service
   ```

2. **Standardize API Error Responses**:
   ```typescript
   // All API routes should return:
   { error: string, details?: string, code?: string }
   ```

3. **Replace Generic Alerts**:
   - Find all `alert()` calls
   - Replace with toast notifications or modal dialogs
   - Show specific error messages (not "Something went wrong")

4. **Add Error States to Components**:
   ```typescript
   const [error, setError] = useState<string | null>(null)
   
   // Display errors in UI:
   {error && (
     <div className="text-red-600 text-sm p-3 bg-red-50 rounded">
       {error}
     </div>
   )}
   ```

5. **Network Error Handling**:
   - Add retry logic for failed requests
   - Show offline indicators
   - Handle timeout scenarios

---

## Task #22 & #23: Remove Free Tier and Update Landing Page

### Task #22: Remove Free Tier

#### Files to Update:

1. **User Registration** (`src/app/(auth)/signup/page.tsx`):
   - Remove free credit assignment
   - Add "Payment Required" step before account creation
   - Redirect to payment page after signup

2. **Database Seed** (`prisma/seed.ts`):
   - Set default creditBalance to 0 (currently 3)

3. **Middleware** (`src/middleware.ts`):
   - Add credit check on all generation routes
   - Redirect to billing if credits = 0

4. **Developer Access**:
   - Update User model to check `isAdmin` or `role === 'admin'`
   - Give unlimited credits to admin users
   ```typescript
   // In generation routes:
   const user = await prisma.user.findUnique({ where: { id: session.user.id }})
   if (!user.isAdmin && user.creditBalance < 1) {
     return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
   }
   ```

### Task #23: Update Landing Page

#### File: `src/app/(marketing)/page.tsx` or `src/app/page.tsx`

#### Changes:
1. **Remove Free Trial Mentions**:
   - Replace "Start Free Trial" with "Get Started"
   - Remove "No credit card required"
   - Add "Paid Plans Starting at $X/month"

2. **Update Hero Section**:
   ```tsx
   <h1>Generate Professional App Store Assets with AI</h1>
   <p>Pay-as-you-go pricing. No subscriptions required.</p>
   <Button>View Pricing</Button>
   ```

3. **Add Pricing Section**:
   - Show credit pack prices
   - Display per-generation cost
   - Add comparison table

4. **Update CTAs**:
   - All buttons should lead to /signup (which requires payment)
   - Add prominent pricing page link

---

## Task #24: Fix Billing Section Errors

### Find Billing Page:
Likely: `src/app/(dashboard)/billing/page.tsx`

### Common Issues to Check:

1. **Stripe Integration**:
   ```typescript
   // Verify these are set:
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY
   - STRIPE_WEBHOOK_SECRET
   ```

2. **API Route Errors**:
   - Check `src/app/api/billing/` routes
   - Look for console errors
   - Verify Prisma queries

3. **Subscription Status**:
   ```typescript
   // Fix subscription fetching:
   const subscription = await prisma.subscription.findUnique({
     where: { userId: session.user.id },
     include: { /* any relations */ }
   })
   ```

4. **Error Messages**:
   - Add try-catch blocks
   - Display specific error messages
   - Handle Stripe API errors gracefully

5. **Test Scenarios**:
   - No subscription
   - Active subscription
   - Cancelled subscription
   - Payment failed

---

## Task #25: Update Background Gradients Across Pages

### Files to Update:
All dashboard pages in `src/app/(dashboard)/`

### Reference: Login Page
File: `src/app/(auth)/login/page.tsx`

### Implementation:

1. **Find Current Gradient**:
   ```typescript
   // Current might be something like:
   className="bg-gradient-to-br from-gray-50 to-gray-100"
   ```

2. **Replace With Login Page Style**:
   - Inspect login page's gradient classes
   - Apply to dashboard layout or individual pages

3. **Pages to Update**:
   - Dashboard (main)
   - Projects
   - Projects/new
   - Projects/[id]
   - Drafts
   - Trash
   - Activity (when created)
   - Settings/Profile
   - Billing

4. **Consistent Approach**:
   ```typescript
   // Option 1: Update layout
   // src/app/(dashboard)/layout.tsx
   <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
   
   // Option 2: Individual pages
   <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] p-8">
   ```

---

## Implementation Order Recommendation

1. **Quick Wins** (1-2 hours):
   - Task #13: Duplicate Screenshot (just API route)
   - Task #25: Background Gradients

2. **Medium Complexity** (2-4 hours):
   - Task #14: Projects Search/Filter
   - Task #15: Dashboard Search/Filter
   - Task #17: Profile Image Upload Fix
   - Task #24: Billing Section Fix

3. **Complex Features** (4-6 hours):
   - Task #16: Global Activity History
   - Task #20: Error Handling
   - Task #12: Undo/Redo for Editor

4. **Business Logic Changes** (2-3 hours):
   - Task #22: Remove Free Tier
   - Task #23: Landing Page Updates

---

## Testing Checklist

After implementing each task:

- [ ] TypeScript compiles without errors
- [ ] All API routes return proper error messages
- [ ] UI updates correctly on success/failure
- [ ] Loading states work properly
- [ ] Database migrations run successfully (if needed)
- [ ] No console errors in browser
- [ ] Mobile responsive (if UI changes)

---

## Database Migrations Needed

Most tasks don't need migrations, but check:

- **Task #16**: ActivityLog table already exists ✓
- **Task #22**: Might want to add `maxCredits` field for admin bypass

---

## Environment Variables to Verify

```env
# Stripe (Tasks #22, #24)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# R2 Storage (Task #17)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

---

## Notes

- All completed features are in production-ready state
- Follow existing code patterns for consistency
- Use the same UI components (Button, Input, etc.)
- Maintain TypeScript strict mode compliance
- Add proper error handling to all async operations

---

**Good luck with implementation! 🚀**
