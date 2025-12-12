# Candidate Job Search Feature - User Guide

## Overview
The "Tìm Việc Làm" (Find Jobs) feature allows candidates to browse available job postings and apply with one click.

---

## How to Access the Feature

### Step 1: Locate the Button
Look at the top-right of the application header. You'll see two buttons:
- **"Tìm Việc Làm"** (emerald green) ← NEW BUTTON for candidates
- **"Đăng Tin Mới"** (blue) for employers

### Step 2: Click the Button
Click the **"Tìm Việc Làm"** button to open the job search modal.

---

## Understanding the Job Listings

### Card Layout
Each job posting is displayed as a card with the following information:

```
┌─────────────────────────────────────────────────────┐
│ Job Title                               [Days Left] │
│ Position • Location                                 │
│ Company Name                                        │
│                                                     │
│ Mức lương: 15,000,000 - 25,000,000 VND             │
│ Hình thức: Full-time                               │
│                                                     │
│ Kỹ năng yêu cầu:                                   │
│ [Java] [Spring Boot] [Docker] [MySQL]              │
│                                                     │
│ Job description preview text here...               │
│                                                     │
│                    [Ứng Tuyển]                      │
└─────────────────────────────────────────────────────┘
```

### Status Indicators

**Days Remaining Badge (Top Right):**
- **Green Badge**: "X ngày" → Posting is active and accepting applications
- **Gray Badge**: "Đã hết hạn" → Application deadline has passed (button disabled)

**Apply Button States:**
1. **Purple/Active**: "Ứng Tuyển" → Click to apply
2. **Gray/Disabled**: "✓ Đã ứng tuyển" → You've already applied (greyed out)
3. **Gray/Disabled**: "Hết hạn" → Application deadline passed (greyed out)
4. **Blue/Loading**: Shows spinner while submitting

---

## How to Apply for a Job

### Application Process

1. **Review the Job Details**
   - Check salary range
   - Verify required skills match your background
   - Review job description

2. **Click the Apply Button**
   - If button is purple → you can apply
   - If button is grey → already applied or deadline passed

3. **Confirmation**
   - On success: Button becomes "✓ Đã ứng tuyển"
   - Green toast notification appears: "Ứng tuyển thành công!"
   - Application is recorded in the system

### Error Messages

| Message | Meaning | Solution |
|---------|---------|----------|
| "Bạn đã ứng tuyển cho vị trí này rồi!" | Already applied | Can't apply twice to same job |
| "Vui lòng đăng nhập để ứng tuyển" | Not logged in | Login to your account first |
| "Ứng tuyển thất bại" | Network/server error | Try again or contact support |

---

## Features Explained

### Skills Display
Required skills are shown as small badges with:
- Clear skill names (e.g., "Java", "Spring Boot")
- Easy to scan layout
- Shows what you need to know for the job

### Salary Information
Displayed in Vietnamese currency (VND) with:
- Minimum salary (bottom range)
- Maximum salary (top range)
- Example: 15,000,000 - 25,000,000 VND

### Work Forms
Shows the type of employment:
- **Full-time**: Traditional employment
- **Part-time**: Part-time work
- **Khác**: Other arrangements

### Deadline Information
- **Days Remaining**: Count down to application deadline
- **Hết hạn**: Application period has closed

---

## Tips for Job Searching

### 1. Check Application Status Regularly
Already-applied jobs show a checkmark (✓). This prevents accidental duplicate applications.

### 2. Review Skill Requirements
Compare job required skills with your experience. If you're missing skills, you can:
- Still apply and learn on the job
- Note the skills for future learning

### 3. Verify Salary Expectations
Check the salary range before applying to ensure it matches your expectations.

### 4. Check Deadlines
Pay attention to "Days Remaining" badge. Don't wait too long to apply!

### 5. Read Job Descriptions
The preview shows part of the description. Click the card or view in detail modal to see full description.

---

## Keyboard Shortcuts (If Applicable)

Currently, all interactions require clicking buttons. Future versions may add:
- Keyboard navigation between jobs
- Enter key to apply
- Escape to close modal

---

## Common Questions

### Q: Can I apply to the same job twice?
**A:** No. The system prevents duplicate applications. Once you apply, the button changes to "✓ Đã ứng tuyển" (Already Applied).

### Q: What happens after I apply?
**A:** Your application is recorded and the employer can review it. They may contact you based on your qualifications.

### Q: Can I withdraw an application?
**A:** Currently, no. Contact the employer directly if you need to withdraw.

### Q: Why are some jobs showing "Hết hạn" (Expired)?
**A:** The application deadline has passed for those jobs. No new applications are accepted.

### Q: Will I be notified about new jobs?
**A:** Currently, no automatic notifications. Check back regularly or watch for updates in your account.

### Q: What are required skills?
**A:** The specific technical skills or certifications needed for the job. Missing a skill doesn't prevent applying—it's just helpful information.

---

## Troubleshooting

### Problem: Modal Won't Open
- **Solution**: Refresh the page and try again

### Problem: Can't See Job Listings
- **Solution**: Wait for loading to complete (spinner should disappear)
- Check your internet connection

### Problem: Apply Button Not Working
- **Solution**: Ensure you're logged in (as candidate, not employer)
- Try applying again
- Contact support if issue persists

### Problem: Already Applied Message, But Not Sure Why
- **Solution**: Check your application history
- This is a protection against double-applying

---

## Next Steps

After applying to jobs:
1. **Monitor Your Applications**
   - Check application status in your candidate dashboard
   - Wait for employer feedback

2. **Continue Job Searching**
   - Apply to multiple opportunities
   - Keep improving your skills

3. **Update Your Profile**
   - Keep your information current
   - Add new skills as you develop them

---

**For Support:**
- Contact: [Support Email]
- FAQ: [FAQ Page]
- Help Center: [Help URL]
