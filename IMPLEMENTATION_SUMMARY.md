# Implementation Summary: Candidate Application Feature

## Feature Overview
Added a complete candidate-side posting browsing and application system to the Job Portal application. This feature allows candidates to:
- View all available job postings
- Browse posting details (salary, skills, location, etc.)
- Apply to postings with duplicate-prevention
- Track which postings they've already applied to

## Files Created

### 1. CandidateAvailablePostingsModal.jsx
**Location:** `frontend/src/components/CandidateAvailablePostingsModal.jsx`

**Purpose:** Modal component displaying all active job postings for candidates

**Key Features:**
- Loads all postings from the API (`postingService.getAll()`)
- Filters only active (non-expired) postings
- Tracks applied postings in a Set to prevent duplicates
- Shows visual indicators for already-applied positions
- Displays posting details including:
  - Job title, position, location
  - Salary range (formatted with locale string)
  - Work form (Full-time, Part-time, others)
  - Required skills as small badges
  - Job description preview
  - Days remaining until deadline

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback to close modal
- `candidateID` (number): Current candidate's ID for applying
- `onApplySuccess` (function): Callback after successful application

**State Management:**
- `postings[]`: Array of all job postings
- `loading`: Loading state for API calls
- `appliedPostingIds`: Set of posting IDs already applied to
- `applyingId`: Currently processing application ID (for loading state)
- `message`: Success/error notification display

**Key Methods:**
- `loadPostings()`: Fetches and filters active postings
- `handleApply()`: Handles apply logic with duplicate prevention

**UI Components:**
- Modal header with title and close button
- Loading spinner during data fetch
- Grid of posting cards with:
  - Title, position, location info
  - Deadline badge (days remaining or "Hết hạn")
  - Salary and work form details
  - Skills pills display
  - Apply button with 3 states: available, already applied, expired
- Footer showing total number of postings
- Toast notifications for success/error messages

---

## Files Modified

### 1. App.jsx
**Location:** `frontend/src/App.jsx`

**Changes Made:**

1. **Added Import:**
   ```javascript
   import CandidateAvailablePostingsModal from './components/CandidateAvailablePostingsModal';
   ```

2. **Added State Variables:**
   ```javascript
   const [candidateAvailablePostingsOpen, setCandidateAvailablePostingsOpen] = useState(false);
   const [candidateID] = useState(1); // TODO: Replace with actual logged-in candidate ID
   ```
   - Note: `candidateID` is currently hardcoded to 1 for demo purposes. In production, this should come from authentication/login system.

3. **Added Handler Function:**
   ```javascript
   const handleOpenCandidateAvailablePostings = () => {
     setCandidateAvailablePostingsOpen(true);
   };
   ```

4. **Updated Header UI:**
   - Added "Tìm Việc Làm" (Find Jobs) button in emerald color next to "Đăng Tin Mới" button
   - Button opens the CandidateAvailablePostingsModal
   - Button includes Search icon for visual consistency

5. **Added Modal Component:**
   ```javascript
   <CandidateAvailablePostingsModal 
     isOpen={candidateAvailablePostingsOpen} 
     onClose={() => setCandidateAvailablePostingsOpen(false)} 
     candidateID={candidateID}
     onApplySuccess={handleApplySuccess}
   />
   ```

6. **Updated handleApplySuccess:**
   - Simplified to reload data and show success notification
   - Removed unused candidate list refresh logic

---

### 2. PostingTable.jsx
**Location:** `frontend/src/components/PostingTable.jsx`

**Changes Made:**

1. **Fixed React Hook Issues:**
   - Moved `useState` hooks to the top of component (before conditional returns)
   - This prevents "called conditionally" React Hook errors
   - React Hooks must always be called in the same order on every render

2. **Removed Unused Props:**
   - Removed `onViewApplies` from destructuring (was unused)
   - Removed `onViewSkillMatching` from destructuring (was unused)
   - Kept: `onEdit`, `onDelete`, `onApply`, `onViewCandidates`

3. **Removed Broken Handler:**
   - Removed attempt to call undefined `onViewDetail` handler

**Before:**
```javascript
const PostingTable = ({ data, loading, onEdit, onDelete, onViewApplies, onApply, onViewCandidates, onViewSkillMatching }) => {
  if (loading) { ... }
  if (data.length === 0) { ... }
  const [detailOpen, setDetailOpen] = useState(false); // ❌ Called after early returns
  ...
  if (onViewDetail) onViewDetail(post); // ❌ onViewDetail not defined
}
```

**After:**
```javascript
const PostingTable = ({ data, loading, onEdit, onDelete, onApply, onViewCandidates }) => {
  const [detailOpen, setDetailOpen] = useState(false); // ✅ At top
  const [selectedPost, setSelectedPost] = useState(null); // ✅ At top
  
  if (loading) { ... }
  if (data.length === 0) { ... }
  ...
  // ✅ No more undefined handler call
}
```

---

## Backend Integration

### Existing API Endpoints Used
The implementation leverages existing backend endpoints:

1. **GET /api/postings** (already exists)
   - Fetches all job postings with required skills
   - Returns: Array of posting objects with `requiredSkills` (comma-separated string)

2. **POST /api/postings/{id}/apply** (already exists)
   - Creates a new application record
   - Request body: `{ candidateID: number }`
   - Includes duplicate prevention via database trigger `trigger_applies_before_insert`
   - Returns: Success/error response

### Database Triggers (Already Implemented)
- `trigger_applies_before_insert`: Prevents duplicate (candidateID, postID) combinations
- `trg_Applies_after_insert`: Increments Posting.NumApply counter

---

## User Flow

### Candidate Workflow:
1. User clicks "Tìm Việc Làm" (Find Jobs) button in header
2. CandidateAvailablePostingsModal opens showing all active postings
3. Candidate can:
   - View posting details (salary, skills, location, description)
   - See which postings they've already applied to (disabled button with ✓)
   - Click "Ứng Tuyển" to apply to a posting
4. On successful application:
   - Button changes to "✓ Đã ứng tuyển" (Already applied)
   - Success toast notification appears
   - Parent component reloads data

### Error Handling:
- Missing login → "Vui lòng đăng nhập để ứng tuyển" (Please login to apply)
- Duplicate apply → "Bạn đã ứng tuyển cho vị trí này rồi!" (Already applied)
- Expired posting → Button disabled with "Hết hạn" (Expired) text
- Network error → Error toast notification

---

## Technical Details

### State Management Pattern:
- Modal state controlled by parent (App.jsx)
- Internal state for UI elements (loading, applied postings, notification)
- Single source of truth for candidate ID

### Data Filtering:
```javascript
const activePostings = data.filter(p => new Date(p.endDate) > new Date());
```
- Automatically filters expired postings from display

### Applied Postings Tracking:
```javascript
const [appliedPostingIds, setAppliedPostingIds] = useState(new Set());
```
- Uses Set for O(1) lookup performance
- Updated on successful application
- Could be enhanced to load from API in future

### Duplicate Prevention:
Two layers of protection:
1. **Frontend:** Visual indicator + disabled button for already-applied postings
2. **Backend:** Database trigger prevents insert if (candidateID, postID) already exists

---

## Styling & UI/UX

### Color Scheme:
- Emerald (#10B981) for candidate action (Tìm Việc Làm button)
- Purple (#9333EA) for apply buttons
- Gray for already-applied/expired states

### Responsive Design:
- Modal works on desktop and mobile
- Cards stack in grid layout
- Two-column salary details grid

### Accessibility:
- Semantic HTML with proper heading hierarchy
- Button states clearly indicated (enabled/disabled/loading)
- Loading spinners for async operations
- Clear error/success messages

---

## Future Enhancement Ideas

1. **Authentication Integration:**
   - Replace hardcoded `candidateID = 1` with actual logged-in user ID
   - Add user login/authentication flow

2. **Advanced Filtering:**
   - Filter by salary range
   - Filter by job location
   - Filter by work form (Full-time, Part-time, etc.)
   - Filter by skill requirements
   - Search by keyword

3. **Persistence:**
   - Load applied postings from API instead of tracking in state
   - Preserve selected filters across sessions

4. **Notifications:**
   - Email notification when new matching jobs appear
   - Notification for application status changes

5. **Skill Matching:**
   - Display match percentage based on candidate's skills
   - Highlight missing required skills
   - Recommend skill improvements

6. **Application History:**
   - View past applications and their status
   - Track application submission date and status changes

---

## Testing Checklist

- [ ] Modal opens when "Tìm Việc Làm" button is clicked
- [ ] Postings load correctly with all required fields
- [ ] Expired postings are filtered out
- [ ] Apply button works and creates application record
- [ ] Duplicate apply prevention works (button disabled, error message)
- [ ] Success notification appears after applying
- [ ] Modal closes properly
- [ ] Data reloads in parent component
- [ ] Works on mobile/tablet sizes
- [ ] Error handling for network failures
- [ ] Loading state shows during API calls

---

## Notes

- The modal is currently hardcoded with `candidateID = 1` for testing. Production implementation should get this from the authentication system.
- All errors and warnings have been fixed in the codebase.
- The component follows existing code patterns and conventions from the Job Portal application.
- Uses existing postingService methods (no new backend endpoints needed).
