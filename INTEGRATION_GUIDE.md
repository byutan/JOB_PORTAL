# Frontend Components Integration Guide

## Button Locations and Actions

### 1. Top Header - "Thống Kê" (Statistics) Button
```
┌─────────────────────────────────────────────────────────────┐
│  Hệ Thống Tuyển Dụng              [Thống Kê]  [Đăng Tin Mới] │
│  Quản lý các tin đăng...                                      │
└─────────────────────────────────────────────────────────────┘
     ↓
  Opens StatisticsDashboard with overall recruitment metrics
```

### 2. PostingTable - Row Hover Actions
```
When hovering over a job posting row:

┌──────────────────────────────────────────────────────────┐
│ ID │ Title │ Salary │ Deadline │ Status │ [Buttons...] │
├──────────────────────────────────────────────────────────┤
│ #5 │ Dev... │ 50M... │ 20/12... │ Active │  🚀 ✏️ 👁️ ⚡ 🗑️  │
└──────────────────────────────────────────────────────────┘
     ↓        ↓        ↓         ↓
   Apply    Edit  View Applies  Skill    Delete
                   (AppliesModal) Matching
```

**Button Order (Left to Right):**
1. **🚀 Purple** - Apply (`onApply`) → ApplyModal
2. **✏️ Blue** - Edit (`onEdit`) → PostingFormModal
3. **👁️ Green** - View Candidates (`onViewCandidates`) → **CandidatesListModal**
4. **⚡ Orange** - Skill Matching (`onViewSkillMatching`) → **SkillMatchingCard**
5. **🗑️ Red** - Delete (`onDelete`)

---

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│  - Manages all state (modals, postings, applies)            │
│  - Handles data loading from API                            │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌────────────────────┐  ┌──────────────────┐  ┌──────────────┐
        │ PostingTable       │  │ PostingFormModal │  │ AppliesModal │
        │ - List postings    │  │ - Create/Edit    │  │ - List apps  │
        │ - Show hover btns  │  │                  │  │              │
        └────────────────────┘  └──────────────────┘  └──────────────┘
          ├─ Apply Button         
          ├─ Edit Button           
          ├─ View Candidates ──────────┐
          ├─ Skill Matching ────────────┤
          └─ Delete Button              │
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼                               ▼
                ┌──────────────────────┐      ┌────────────────────┐
                │ CandidatesListModal  │      │ SkillMatchingCard  │
                │ NEW - Displays all   │      │ NEW - Shows skill  │
                │ candidates with:     │      │ match analysis:    │
                │ - Name, email, phone │      │ - % match scores   │
                │ - Title, exp, skills │      │ - Color indicators │
                │ - Search, filter     │      │ - Ranking by match │
                │                      │      │ - Sort options     │
                └──────────────────────┘      └────────────────────┘

        Header "Thống Kê" Button
                │
                ▼
        ┌──────────────────────────────┐
        │ StatisticsDashboard          │
        │ NEW - Shows employer metrics:│
        │ - Total postings count       │
        │ - Total applicants count     │
        │ - Active/Expired breakdown   │
        │ - Top skills in demand       │
        │ - Top 5 postings by apps     │
        └──────────────────────────────┘

        Also Existing (not new):
        - CandidateProfileModal
        - ApplyModal
        - StatisticsDashboard
```

---

## Data Flow

### CandidatesListModal
```
User clicks 👁️ button
    ↓
handleOpenCandidatesListModal(posting)
    ↓
Sets: selectedPostingForCandidates = posting
      candidatesListOpen = true
    ↓
CandidatesListModal mounts with posting prop
    ↓
useEffect triggers → loadCandidates()
    ↓
postingService.getCandidatesByPosting(postID)
    ↓
GET /api/postings/:id/candidates
    ↓
Display candidates with search/filter
```

### SkillMatchingCard
```
User clicks ⚡ button
    ↓
handleOpenSkillMatchingModal(posting)
    ↓
Sets: selectedPostingForSkills = posting
      skillMatchingOpen = true
    ↓
SkillMatchingCard mounts with posting prop
    ↓
useEffect triggers → loadSkillAnalysis()
    ↓
postingService.getSkillAnalysis(postID)
    ↓
GET /api/postings/:id/skill-analysis
    ↓
Display candidates ranked by skill match %
```

### StatisticsDashboard
```
User clicks "Thống Kê" button
    ↓
setStatisticsDashboardOpen(true)
    ↓
StatisticsDashboard mounts with all postings
    ↓
useEffect triggers → loadStatistics()
    ↓
For each posting:
  - Fetch applies via postingService.getApplies(postID)
  - Aggregate: candidate counts, skills, etc.
    ↓
Calculate metrics:
  - Total postings, applicants, active/expired
  - Top skills in demand
  - Top postings by applicant count
    ↓
Display comprehensive statistics dashboard
```

---

## File Structure

```
frontend/src/
├── App.jsx (UPDATED)
│   └── Added 3 new state variables
│   └── Added 2 new handlers
│   └── Added import for 3 new components
│   └── Added 3 new modal renderings
│
├── components/
│   ├── PostingTable.jsx (UPDATED)
│   │   └── Added onViewCandidates prop
│   │   └── Added onViewSkillMatching prop
│   │   └── Wired new button handlers
│   │
│   ├── CandidatesListModal.jsx (NEW)
│   │   └── 320 lines
│   │   └── Displays candidate list with search
│   │   └── Shows skills, match %, contact info
│   │
│   ├── SkillMatchingCard.jsx (NEW)
│   │   └── 310 lines
│   │   └── Displays skill match analysis
│   │   └── Shows colored progress bars
│   │   └── Sortable by % or name
│   │
│   ├── StatisticsDashboard.jsx (NEW)
│   │   └── 330 lines
│   │   └── Shows employer statistics
│   │   └── Key metrics + detailed analytics
│   │
│   └── ... (existing components)
│
└── ... (other files unchanged)
```

---

## Testing Scenarios

### Scenario 1: View Candidates for a Job
1. Open browser to `http://localhost:5173`
2. Hover over any job posting row
3. Click green 👁️ button
4. **Expected**: CandidatesListModal opens showing all applicants
5. Type in search box to filter by name/email
6. **Expected**: List updates in real-time

### Scenario 2: Analyze Skill Matching
1. From PostingTable, hover over a job row
2. Click orange ⚡ button
3. **Expected**: SkillMatchingCard opens with candidates ranked by skill match %
4. See color-coded badges (green = perfect match, red = no match)
5. Click "Độ Phù Hợp" to sort by %, or "Tên Ứng Viên" to sort by name

### Scenario 3: View Overall Statistics
1. From top header, click "Thống Kê" button
2. **Expected**: StatisticsDashboard opens with 4 large metric cards
3. See breakdown of posting status (active/expired)
4. See top skills in demand
5. Scroll down to see top 5 most-applied postings

---

## Styling Reference

### Modal Headers
- **CandidatesListModal**: Blue gradient (blue-600 → blue-700)
- **SkillMatchingCard**: Purple-Pink gradient (purple-600 → pink-600)
- **StatisticsDashboard**: Indigo-Blue gradient (indigo-600 → blue-600)

### Action Buttons
- **Primary**: Blue (`bg-blue-600 hover:bg-blue-700`)
- **Secondary**: Gray (`bg-gray-300 hover:bg-gray-400`)
- **Danger**: Red (`bg-red-600 hover:bg-red-700`)

### Color Codes (Skill Matching)
- **✅ Green (≥80%)**: Rất phù hợp (Very suitable)
- **✅ Blue (60-79%)**: Phù hợp (Suitable)
- **⚠️ Yellow (40-59%)**: Tạm chấp nhận (Acceptable)
- **❌ Red (<40%)**: Cần xem xét (Needs review)

---

## Notes

- All three new components use existing API endpoints
- No new backend changes needed for basic functionality
- Components are fully self-contained and don't depend on each other
- All styling uses Tailwind CSS (no custom CSS files)
- Full Vietnamese language support (UI text in Vietnamese)
- Responsive design works on all device sizes

---
