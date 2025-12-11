# Database Analysis: N/A Issue in Candidate List

## Executive Summary

The "N/A" values appearing in the candidate list are caused by **NULL or missing data in User table fields** that the `sp_AnalyzeCandidateSkillMatch` stored procedure tries to join with. The frontend components handle this gracefully by displaying "N/A" as a fallback when data is missing.

---

## 1. Stored Procedure: `sp_AnalyzeCandidateSkillMatch` Definition

### Purpose
Analyzes the skill match between candidates who have applied to a job posting and the required skills for that position.

### Input Parameters
- `p_postID INT UNSIGNED` - The job posting ID

### SQL Definition
```sql
CREATE PROCEDURE sp_AnalyzeCandidateSkillMatch(
    IN p_postID INT UNSIGNED
)
BEGIN
    SELECT 
        c.CandidateID,
        u.fullName AS CandidateName,
        u.emailAddr AS ContactEmail,
        c.currentTitle AS CurrentJobTitle,
        c.totalYearOfExp AS YearsOfExperience,
        COUNT(DISTINCT h.skillID) AS TotalCandidateSkills,
        COUNT(DISTINCT CASE 
            WHEN h.skillID IN (SELECT skillID FROM `Require` WHERE postID = p_postID)
            THEN h.skillID 
        END) AS MatchedSkillCount,
        (SELECT COUNT(DISTINCT skillID) FROM `Require` WHERE postID = p_postID) AS TotalRequiredSkills,
        ROUND(
            (COUNT(DISTINCT CASE 
                WHEN h.skillID IN (SELECT skillID FROM `Require` WHERE postID = p_postID)
                THEN h.skillID 
            END) / 
            GREATEST((SELECT COUNT(DISTINCT skillID) FROM `Require` WHERE postID = p_postID), 1)) * 100
        , 2) AS MatchPercentage,
        GROUP_CONCAT(
            DISTINCT CASE 
                WHEN h.skillID IN (SELECT skillID FROM `Require` WHERE postID = p_postID)
                THEN s.skillName
            END
            SEPARATOR ', '
        ) AS MatchedSkillList
    FROM 
        Candidate c
        LEFT JOIN `User` u ON c.CandidateID = u.userID
        LEFT JOIN Has h ON c.CandidateID = h.CandidateID
        LEFT JOIN Skill s ON h.skillID = s.SkillID
        INNER JOIN Applies a ON c.CandidateID = a.CandidateID AND a.postID = p_postID
    GROUP BY 
        c.CandidateID, u.fullName, u.emailAddr, c.currentTitle, c.totalYearOfExp
    ORDER BY 
        MatchPercentage DESC, CandidateName ASC;
END
```

### Location in Code
- Called in: [backend/controllers/postingController.js](backend/controllers/postingController.js#L352)
- Endpoint: `GET /api/postings/:id/skill-analysis`
- Function: `getSkillAnalysis()`

---

## 2. Fields Returned by the Procedure

The procedure returns **11 columns**:

| Column Name | Source Table | Data Type | Notes |
|---|---|---|---|
| `CandidateID` | `Candidate.CandidateID` | INT | Primary key for candidate |
| `CandidateName` | `User.fullName` | VARCHAR | **Can be NULL if User record missing** |
| `ContactEmail` | `User.emailAddr` | VARCHAR | **Can be NULL if User record missing** |
| `CurrentJobTitle` | `Candidate.currentTitle` | VARCHAR | **Can be NULL if not filled** |
| `YearsOfExperience` | `Candidate.totalYearOfExp` | INT | **Can be NULL if not provided** |
| `TotalCandidateSkills` | Calculated COUNT | INT | Count of distinct skills from `Has` table |
| `MatchedSkillCount` | Calculated COUNT | INT | Count of matched skills with requirement |
| `TotalRequiredSkills` | Calculated COUNT | INT | Count of required skills from `Require` table |
| `MatchPercentage` | Calculated ROUND | DECIMAL(5,2) | Percentage match: (MatchedSkillCount / TotalRequiredSkills) * 100 |
| `MatchedSkillList` | Calculated GROUP_CONCAT | VARCHAR | Comma-separated list of matched skill names |

---

## 3. Database Joins and Data Flow

### Join Chain Analysis

```
┌─────────────────────────────────────────────────────────────┐
│                    PRIMARY DATA SOURCE                       │
│ Applies a (INNER JOIN) - Only candidates who applied        │
│ └─ a.postID = ? AND a.CandidateID                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
        ┌─────────────────────┐  ┌──────────────────┐
        │   Candidate c       │  │   User u         │
        │  (LEFT JOIN)        │  │  (LEFT JOIN)     │
        │  c.CandidateID      │  │  on c.CandidateID│
        │  = a.CandidateID    │  │  = u.userID      │
        └──────────┬──────────┘  └────────┬─────────┘
                   │                      │
                   │ PROBLEM ZONE:        │
                   │ ⚠️  NULL Risk        │ ⚠️ NULL Risk
                   │                      │
                   ▼                      ▼
        c.currentTitle         u.fullName (CandidateName)
        c.totalYearOfExp       u.emailAddr (ContactEmail)
                   
                   │
                   ▼
        ┌─────────────────────┐
        │    Has h            │
        │  (LEFT JOIN)        │
        │  h.CandidateID      │
        │  = c.CandidateID    │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │   Skill s           │
        │  (LEFT JOIN)        │
        │  s.SkillID          │
        │  = h.skillID        │
        └─────────────────────┘
                   │
                   ▼
        s.skillName (MatchedSkillList)
```

### Critical Points

1. **INNER JOIN on Applies** - Ensures only candidates who have applied are returned
2. **LEFT JOIN on User** - ⚠️ **RISK**: User record may not exist for a candidate
   - If no User record exists, `fullName` and `emailAddr` will be NULL
3. **LEFT JOIN on Has** - Handles candidates with no skills recorded
4. **LEFT JOIN on Skill** - Handles skill records that may be missing

---

## 4. Root Causes of "N/A" Values

### Primary Cause: Missing User Records

When the procedure executes:
```sql
LEFT JOIN `User` u ON c.CandidateID = u.userID
```

If no User record exists with `userID = c.CandidateID`:
- `u.fullName` returns NULL → Frontend displays "N/A"
- `u.emailAddr` returns NULL → Frontend displays "N/A"

### Secondary Causes: Missing Candidate Data

1. **CurrentJobTitle is NULL** in Candidate table
   - Field `currentTitle` not filled when candidate registered
   - Frontend displays: "N/A"

2. **YearsOfExperience is NULL** in Candidate table
   - Field `totalYearOfExp` not filled
   - Frontend displays: "N/A"

3. **No Skills in Has table**
   - Candidate has no skills recorded
   - Result: 0 matched and total candidate skills

4. **Missing Skill Records**
   - If referenced skill IDs don't exist in Skill table
   - MatchedSkillList displays incomplete data

---

## 5. Frontend Handling of NULL/Missing Data

### CandidatesListModal.jsx (Lines 40-50)
```javascript
const list = (Array.isArray(raw) ? raw : []).map((c, i) => {
  return {
    CandidateID: c.CandidateID ?? c.candidateID ?? `c_${i}`,
    fullName: c.CandidateName ?? c.fullName ?? '',  // Empty if NULL
    emailAddr: c.ContactEmail ?? c.emailAddr ?? c.email ?? '',  // Empty if NULL
    phoneNumber: c.phoneNumber ?? c.phone ?? '',
    currentTitle: c.CurrentJobTitle ?? c.currentTitle ?? '',  // Empty if NULL
    totalYearOfExp: c.totalYearOfExp ?? null,
    // ... other fields
  };
});
```

### Display Logic (Lines 273, 302, 306)
```jsx
{candidate.fullName || 'N/A'}           // Shows "N/A" if empty
<span>{candidate.emailAddr || 'N/A'}</span>
<span>{candidate.phoneNumber || 'N/A'}</span>
```

### SkillMatchingCard.jsx (Lines 200-202)
```javascript
const candidateName = candidate.fullName || 'N/A';
const jobTitle = candidate.currentTitle || 'N/A';
```

---

## 6. Database Connection Configuration

### Location: [backend/config/db.js](backend/config/db.js)

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**Configuration:**
- Uses `mysql2/promise` for async/await support
- Connection pooling with max 10 connections
- Credentials from `.env` file
- Database: `job_portal`

---

## 7. Backend Procedure Execution

### Controller Method: `getSkillAnalysis()` (Lines 340-417)

```javascript
const getSkillAnalysis = async (req, res) => {
    const { id } = req.params;  // postID

    // 1. Verify posting exists
    const [postRows] = await pool.execute(
        'SELECT postID FROM Posting WHERE postID = ?', 
        [id]
    );
    
    // 2. Call procedure
    const sql = `CALL sp_AnalyzeCandidateSkillMatch(?)`;
    const [result] = await pool.execute(sql, [id]);
    
    // 3. Extract result (handle MySQL version differences)
    let data = [];
    if (Array.isArray(result) && result.length > 0) {
        if (Array.isArray(result[0])) {
            data = result[0];  // Typical case
        } else {
            data = result;
        }
    }
    
    // 4. Enrich with CandidateID if missing (fallback logic)
    if (data.length > 0 && !data[0].CandidateID) {
        // Multiple attempts to find CandidateID from User table
        // Try: exact email, full name, Candidate+User join
    }
    
    // 5. Return response
    res.status(200).json({
        success: true,
        message: 'Phân tích kỹ năng ứng viên',
        postID: id,
        candidates: data
    });
};
```

---

## 8. Specific Issues and Risks

### 🔴 Critical Risk: Data Integrity Gap

**Problem:** The procedure uses `LEFT JOIN` on User table, but if no User record exists:
- The candidate still appears in results (correct)
- But CandidateName and ContactEmail are NULL (problematic)

**Risk Scenario:**
```
Candidate Record: CandidateID=5, currentTitle='Developer', totalYearOfExp=3
User Record: MISSING ❌
Procedure Result: CandidateID=5, CandidateName=NULL, ContactEmail=NULL, ...
Frontend Display: N/A, N/A
```

### 🟡 Secondary Risk: Incomplete Candidate Profiles

**Issue:** Candidates with missing profile information:
- No job title in Candidate table → "N/A" displayed
- No years of experience → Cannot calculate seniority
- No skills recorded in Has table → 0% match percentage

### 🟡 Tertiary Risk: Skill Matching Accuracy

**Issue:** Incomplete skill matching due to:
- Candidate skills not recorded → Lower match percentage (may be false negative)
- Required skills missing from Skill table → Incorrect match count

---

## 9. Summary Table: Data Sources and NULL Risks

| Field | Table.Column | Join Type | NULL Risk | Frontend Fallback |
|---|---|---|---|---|
| CandidateID | Candidate.CandidateID | Primary Key | Low | ID fallback (c_#) |
| CandidateName | User.fullName | LEFT | **HIGH** ⚠️ | "N/A" |
| ContactEmail | User.emailAddr | LEFT | **HIGH** ⚠️ | "N/A" |
| CurrentJobTitle | Candidate.currentTitle | N/A | **MEDIUM** | "N/A" |
| YearsOfExperience | Candidate.totalYearOfExp | N/A | MEDIUM | null |
| MatchPercentage | Calculated | N/A | Low | 0% |
| MatchedSkillList | Skill.skillName | LEFT | MEDIUM | Empty string |

---

## 10. Recommended Solutions

### Option 1: Ensure User Records Exist (Preferred)
**Action:** When a Candidate is created, ensure a corresponding User record exists
```sql
-- Verify relationship
SELECT c.CandidateID, u.userID
FROM Candidate c
LEFT JOIN `User` u ON c.CandidateID = u.userID
WHERE u.userID IS NULL;  -- These are problematic
```

### Option 2: Use INNER JOIN in Procedure (Strict Validation)
**Change:** If User data is essential, use INNER JOIN instead of LEFT JOIN
```sql
INNER JOIN `User` u ON c.CandidateID = u.userID  -- Require User record
```

### Option 3: Populate Candidate Profile at Registration
**Action:** Make currentTitle and totalYearOfExp mandatory fields during candidate signup

### Option 4: Add Default Values
**Change:** In procedure, use COALESCE to provide defaults:
```sql
COALESCE(u.fullName, c.CandidateID, 'Unknown') AS CandidateName,
COALESCE(u.emailAddr, 'No Email', 'Unknown') AS ContactEmail,
```

---

## 11. Related Stored Procedures

### Second Procedure: `get_candidates_by_post()`
Called in `getCandidatesByPosting()` function
- Used by CandidatesListModal component
- Returns candidate list for a specific posting
- Definition not shown in current analysis (requires database inspection)

---

## Conclusion

**The "N/A" values are intentional frontend safeguards** against missing or NULL database values. The root cause is:

1. **Primary:** Missing User records when Candidate records exist
2. **Secondary:** Incomplete candidate profile information (currentTitle, totalYearOfExp)
3. **Tertiary:** Missing skill records in the Has table

**To eliminate "N/A" values:**
- Ensure Candidate-User relationship integrity
- Enforce mandatory profile completion at registration
- Maintain accurate skill records in the Has table
