# New Frontend Components Guide

This document describes the three new components added to the job portal frontend system.

## Overview

Three new components have been created to provide analytics, candidate management, and employer statistics:

1. **CandidatesListModal** - Display and search candidates applying to a posting
2. **SkillMatchingCard** - Analyze skill matching between candidates and job requirements  
3. **StatisticsDashboard** - Employer dashboard with aggregate statistics

---

## 1. CandidatesListModal Component

**Location:** `frontend/src/components/CandidatesListModal.jsx`

### Purpose
Display a modal showing all candidates who have applied to a specific job posting with search and filtering capabilities.

### Features
- **Search Functionality**: Search candidates by name, email, phone number, or job title
- **Candidate Information**: Displays:
  - Full name and current job title
  - Email and phone contact information
  - Years of experience
  - Skills (with limit of 5 displayed, +N more indicator)
  - Self-introduction quote
  - Skill match percentage (if available from API)
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Shows spinner while loading data
- **Error Handling**: Displays error messages with retry button
- **Empty States**: Shows appropriate message when no candidates found

### API Integration
- Uses `postingService.getCandidatesByPosting(postId)`
- Endpoint: `GET /api/postings/:id/candidates`

### Props
```javascript
{
  isOpen: boolean,           // Controls modal visibility
  onClose: function,         // Called when closing modal
  posting: object {
    postID: number,
    jobTitle: string
  }
}
```

### Example Usage
```jsx
<CandidatesListModal 
  isOpen={candidatesListOpen}
  onClose={() => setCandidatesListOpen(false)}
  posting={selectedPosting}
/>
```

---

## 2. SkillMatchingCard Component

**Location:** `frontend/src/components/SkillMatchingCard.jsx`

### Purpose
Provide skill analysis for candidates applying to a position, showing matching percentage and detailed skill comparison.

### Features
- **Match Percentage Visualization**:
  - Color-coded bars (Green ≥80%, Blue 60-79%, Yellow 40-59%, Red <40%)
  - Real-time progress bar animation
  - Match quality labels (Very Suitable, Suitable, Acceptable, Needs Review)

- **Summary Statistics**: 
  - Count of candidates in each match tier
  - Total applicants count
  
- **Sorting Options**:
  - Sort by match percentage (descending)
  - Sort by candidate name (alphabetical)

- **Detailed Candidate Information**:
  - Ranking (1st, 2nd, 3rd, etc.)
  - Name and current job title
  - Contact phone number
  - Years of experience
  - Matched skills display
  - Total skills count

- **Color-Coded System**:
  - Green badges for matched/suitable skills
  - Color bars indicating match quality

### API Integration
- Uses `postingService.getSkillAnalysis(postId)`
- Endpoint: `GET /api/postings/:id/skill-analysis`

### Props
```javascript
{
  isOpen: boolean,           // Controls modal visibility
  onClose: function,         // Called when closing modal
  posting: object {
    postID: number,
    jobTitle: string
  }
}
```

### Example Usage
```jsx
<SkillMatchingCard
  isOpen={skillMatchingOpen}
  onClose={() => setSkillMatchingOpen(false)}
  posting={selectedPosting}
/>
```

---

## 3. StatisticsDashboard Component

**Location:** `frontend/src/components/StatisticsDashboard.jsx`

### Purpose
Provide employers with a comprehensive dashboard showing overall recruitment metrics and analytics.

### Features

#### Key Metrics (Top Cards)
- **Total Job Postings**: Count of all active and inactive postings
- **Total Applicants**: Sum of all applications across all postings
- **Active Postings**: Count of postings with future end dates
- **Avg Applicants/Posting**: Average number of applicants per posting

#### Status Overview
- **Active vs Expired Postings**: Visual progress bars showing distribution
- Color-coded: Green for active, Red for expired

#### Top Skills in Demand
- Bar chart showing most frequently requested skills
- Normalized bars showing relative demand
- Displays top 10 skills by applicant count

#### Top 5 Postings by Applicants
- Ranked list of most popular job postings
- Shows:
  - Ranking (#1, #2, etc.)
  - Job title and company name
  - Number of applicants
  - Salary range
  - Progress bar showing relative popularity

### Features
- **Real-time Aggregation**: Loads and aggregates data from all postings
- **Loading States**: Spinner while aggregating data
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Color-coded Metrics**: Intuitive visual indicators
- **Error Handling**: Handles failed API calls gracefully

### API Integration
- Uses `postingService.getApplies(postId)` for each posting
- Aggregates data from multiple endpoints
- No single endpoint; builds dashboard from available data

### Props
```javascript
{
  isOpen: boolean,              // Controls modal visibility
  onClose: function,            // Called when closing modal
  postings: array [
    {
      postID: number,
      jobTitle: string,
      companyName: string,
      salaryMin: number,
      salaryMax: number,
      endDate: string
    }
  ]
}
```

### Example Usage
```jsx
<StatisticsDashboard
  isOpen={statisticsDashboardOpen}
  onClose={() => setStatisticsDashboardOpen(false)}
  postings={postings}
/>
```

---

## Integration with App.jsx

### State Management
The following state variables were added to `App.jsx`:

```javascript
const [candidatesListOpen, setCandidatesListOpen] = useState(false);
const [selectedPostingForCandidates, setSelectedPostingForCandidates] = useState(null);
const [skillMatchingOpen, setSkillMatchingOpen] = useState(false);
const [selectedPostingForSkills, setSelectedPostingForSkills] = useState(null);
const [statisticsDashboardOpen, setStatisticsDashboardOpen] = useState(false);
```

### Event Handlers
```javascript
// Open Candidates List Modal
const handleOpenCandidatesListModal = (posting) => {
  setSelectedPostingForCandidates(posting);
  setCandidatesListOpen(true);
};

// Open Skill Matching Modal
const handleOpenSkillMatchingModal = (posting) => {
  setSelectedPostingForSkills(posting);
  setSkillMatchingOpen(true);
};

// Statistics Dashboard opens via top button
setStatisticsDashboardOpen(true)
```

### UI Integration
1. **PostingTable Row Actions** (on hover):
   - Eye icon with list: Opens CandidatesListModal
   - Lightning icon: Opens SkillMatchingCard

2. **Header Button**:
   - "Thống Kê" (Statistics) button opens StatisticsDashboard

---

## UI/UX Design

### Color Scheme
- **CandidatesListModal**: Blue accent (blue-600)
- **SkillMatchingCard**: Purple/Pink accent (purple-600 to pink-600)
- **StatisticsDashboard**: Indigo accent (indigo-600)

### Responsive Breakpoints
- Mobile: Single column layouts
- Tablet/Desktop (md): 2-column layouts
- Large Desktop (lg): 4-column grid for metrics

### Tailwind CSS Classes Used
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Color variants: `bg-blue-50`, `text-blue-600`, `border-blue-200`
- Animations: `animate-spin`, `transition-all`, `hover:shadow-md`

---

## Dependencies

All components use existing dependencies:
- React (hooks: useState, useEffect)
- Lucide React icons (X, Search, Users, Zap, etc.)
- Tailwind CSS for styling
- postingService from existing services

No additional npm packages required.

---

## Testing Checklist

- [ ] Click "Danh Sách Ứng Viên" button on a posting to open CandidatesListModal
- [ ] Search candidates by different fields
- [ ] Verify match percentage displays correctly
- [ ] Click "Phân Tích Kỹ Năng" button to open SkillMatchingCard
- [ ] Sort candidates by match percentage
- [ ] Sort candidates by name
- [ ] Click "Thống Kê" button to open StatisticsDashboard
- [ ] Verify statistics load correctly with sample data
- [ ] Test on mobile/tablet/desktop viewport sizes
- [ ] Test error states by disconnecting backend
- [ ] Test empty states with no applicants

---

## Future Enhancements

Potential improvements for these components:

1. **CandidatesListModal**:
   - Add "Quick View Profile" button
   - Add candidate filtering by skills
   - Export candidates list to CSV

2. **SkillMatchingCard**:
   - Add skill weight indicators
   - Show detailed skill gap analysis
   - Rank candidates with scoring algorithm

3. **StatisticsDashboard**:
   - Add date range selector for historical data
   - Export statistics as PDF report
   - Add charts library (Chart.js, Recharts) for better visualizations
   - Add trends over time (weekly/monthly applicant growth)
   - Add applicant source analytics

---

## Troubleshooting

### Modal not opening
- Check that posting object is passed correctly with postID
- Verify state variables are properly initialized

### Data not loading
- Check browser console for API errors
- Verify backend is running on http://localhost:3000
- Check that /api/postings/:id/candidates endpoint exists
- Check that /api/postings/:id/skill-analysis endpoint exists

### Styling issues
- Ensure Tailwind CSS is configured correctly
- Check that no conflicting CSS is overriding classes

---

## API Requirements

### Required Backend Endpoints

1. **GET /api/postings/:id/candidates**
   - Returns: `{ candidates: Array<Candidate> }`
   - Each candidate should have: `CandidateID, fullName, emailAddr, phoneNumber, currentTitle, totalYearOfExp, skills[], matchPercentage`

2. **GET /api/postings/:id/skill-analysis**
   - Returns: `{ candidates: Array<CandidateSkillAnalysis> }`
   - Each candidate should have: `CandidateID, fullName, matchPercentage, matchedSkills[], totalSkills`

3. **GET /api/postings/:id/applies**
   - Returns: `Array<Apply>`
   - Used by StatisticsDashboard to aggregate applicant counts

---
