# Fix: CandidateID Not Found in Procedure Result

## Problem
The stored procedure `sp_AnalyzeCandidateSkillMatch` was not returning `CandidateID` field, causing the enrichment logic to repeatedly try to fetch it from the User table.

## Solution
Updated the stored procedure to include `CandidateID` in its SELECT statement.

## Steps to Apply

### 1. Run the SQL Fix
Execute this command in your MySQL database:

```bash
mysql -u root -p job_portal < FIX_PROCEDURE.sql
```

Or paste the content of `FIX_PROCEDURE.sql` directly into your MySQL client:

```sql
-- Run this in your MySQL database
DROP PROCEDURE IF EXISTS sp_AnalyzeCandidateSkillMatch;

DELIMITER $$

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
END$$

DELIMITER ;
```

### 2. Verify the Fix
Test that the procedure returns CandidateID:

```sql
CALL sp_AnalyzeCandidateSkillMatch(1);
```

You should see `CandidateID` in the result columns.

### 3. Backend Update (Already Done)
The backend controller has been updated to:
- Remove the enrichment logic that was repeatedly querying the User table
- Add logging to show which candidates were retrieved

## What Changed

### Before
```javascript
if (data.length > 0 && !data[0].CandidateID) {
    console.log('CandidateID not found in procedure result, enriching data...');
    // Query User table for each candidate...
}
```

### After
```javascript
if (data.length > 0) {
    console.log(`Retrieved ${data.length} candidates from skill analysis procedure`);
    // CandidateID is already in the result from the procedure
}
```

## Result
✅ No more "CandidateID not found" console logs
✅ Faster response times (no extra queries)
✅ Cleaner backend code
✅ Procedure returns complete candidate data including CandidateID
