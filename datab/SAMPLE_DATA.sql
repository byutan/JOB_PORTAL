SET FOREIGN_KEY_CHECKS = 0;

-- Insert User data
INSERT INTO `User` (userID, fullName, emailAddr, phoneNumber, password, Sex, birthDate, address) VALUES 
(1, 'Nguyễn Văn A', 'nguyena@gmail.com', '0912345678', 'Password@123', 'Nam', '1995-05-15', 'Hà Nội'),
(2, 'Trần Thị B', 'tranb@gmail.com', '0987654321', 'SecurePass#456', 'Nữ', '1998-08-22', 'TP HCM'),
(3, 'Phạm Văn C', 'phamc@gmail.com', '0901234567', 'MyPass@789', 'Nam', '1996-03-10', 'Hải Phòng'),
(4, 'Lê Thị D', 'led@gmail.com', '0934567890', 'SafePass!234', 'Nữ', '1997-11-05', 'Đà Nẵng'),
(5, 'Hoàng Văn E', 'hoange@gmail.com', '0945678901', 'Strong#Pass567', 'Nam', '1994-07-18', 'Cần Thơ'),
(6, 'Vũ Thị F', 'vuf@gmail.com', '0956789012', 'TestPass@890', 'Nữ', '1999-12-30', 'Hà Nội'),
(7, 'Đặng Văn G', 'dangg@gmail.com', '0967890123', 'Admin@123Pass', 'Nam', '1992-02-14', 'TP HCM'),
(8, 'Bùi Thị H', 'buih@gmail.com', '0978901234', 'Valid#Pass123', 'Nữ', '2000-06-08', 'Hà Nội'),
(9, 'Dương Văn I', 'duongi@gmail.com', '0989012345', 'Expert@Pass456', 'Nam', '1993-09-25', 'Hồ Chí Minh'),
(10, 'Cao Thị J', 'caoj@gmail.com', '0990123456', 'Strong!Pass789', 'Nữ', '1998-01-12', 'Hà Nội'),
(11, 'Nguyễn Minh K', 'minhk@gmail.com', '0901122334', 'Pass@110000', 'Nam', '1994-04-01', 'Hà Nội'),
(12, 'Trần Văn L', 'vanl@gmail.com', '0902233445', 'Pass@120000', 'Nam', '1993-05-02', 'TP HCM'),
(13, 'Phan Thị M', 'thim@gmail.com', '0903344556', 'Pass@130000', 'Nữ', '1992-06-03', 'Đà Nẵng'),
(14, 'Lê Văn N', 'vann@gmail.com', '0904455667', 'Pass@140000', 'Nam', '1991-07-04', 'Hải Phòng'),
(15, 'Hoàng Thị O', 'tho@gmail.com', '0905566778', 'Pass@150000', 'Nữ', '1990-08-05', 'Cần Thơ'),
(16, 'Vũ Minh P', 'minhp@gmail.com', '0906677889', 'Pass@160000', 'Nam', '1989-09-06', 'Hà Nội'),
(17, 'Đặng Thị Q', 'thiq@gmail.com', '0907788990', 'Pass@170000', 'Nữ', '1995-10-07', 'TP HCM'),
(18, 'Bùi Văn R', 'vanr@gmail.com', '0908899001', 'Pass@180000', 'Nam', '1996-11-08', 'Hà Nội'),
(19, 'Dương Thị S', 'this@gmail.com', '0909900112', 'Pass@190000', 'Nữ', '1997-12-09', 'Đà Nẵng'),
(20, 'Cao Văn T', 'vant@gmail.com', '0910011223', 'Pass@200000', 'Nam', '1998-01-10', 'Hải Phòng'),
(21, 'Ngô Thị U', 'thiu@gmail.com', '0911122334', 'Pass@210000', 'Nữ', '1993-02-11', 'TP HCM'),
(22, 'Trịnh Văn V', 'vanv@gmail.com', '0912233445', 'Pass@220000', 'Nam', '1992-03-12', 'Hà Nội'),
(23, 'Phùng Thị W', 'thiw@gmail.com', '0913344556', 'Pass@230000', 'Nữ', '1991-04-13', 'Cần Thơ'),
(24, 'Lý Văn X', 'vanx@gmail.com', '0914455667', 'Pass@240000', 'Nam', '1990-05-14', 'Hà Nội'),
(25, 'Hà Thị Y', 'thiy@gmail.com', '0915566778', 'Pass@250000', 'Nữ', '1989-06-15', 'Đà Nẵng'),
(26, 'Tạ Văn Z', 'vanz@gmail.com', '0916677889', 'Pass@260000', 'Nam', '1988-07-16', 'TP HCM'),
(27, 'Lê Minh Quân', 'leminquang@gmail.com', '0921122334', 'StrongPass@123', 'Nam', '1988-03-20', 'Hà Nội'),
(28, 'Ngô Thảo Nhi', 'ngothaonhi@gmail.com', '0922233445', 'SecurePass#456', 'Nữ', '1999-04-15', 'TP HCM'),
(29, 'Trịnh Văn Tâm', 'trinhtam@gmail.com', '0923344556', 'MyPassword@789', 'Nam', '1991-05-25', 'Đà Nẵng'),
(30, 'Phạm Hương Thảo', 'phamhuongtao@gmail.com', '0924455667', 'SafePass!234', 'Nữ', '1994-06-10', 'Hải Phòng');

-- Insert Candidate data
INSERT INTO `Candidate` (CandidateID, currentTitle, selfIntro, totalYearOfExp) VALUES 
(1, 'Senior Backend Developer', 'Experienced backend developer with 5 years in Java and Spring Boot', 5),
(2, 'Frontend Developer', 'Passionate frontend developer specializing in React and Vue.js', 4),
(3, 'Full Stack Developer', 'Full stack expert with expertise in MERN stack', 5),
(4, 'UI/UX Designer', 'Creative designer with 4 years of experience in digital design', 4),
(5, 'Data Analyst', 'Data analyst with strong skills in SQL and Python', 3),
(6, 'DevOps Engineer', 'DevOps specialist focused on CI/CD and cloud deployment', 4),
(7, 'Product Manager', 'Product manager with background in tech startups', 6),
(8, 'QA Engineer', 'Quality assurance engineer with expertise in automation testing', 3),
(9, 'Mobile Developer', 'Mobile developer specializing in iOS and Android', 4),
(10, 'Machine Learning Engineer', 'ML engineer focused on NLP and computer vision', 3);

-- Insert Staff data
INSERT INTO `Staff` (StaffID, position, department) VALUES 
(21, 'Support Staff', 'Customer Support'),
(22, 'Administrator', 'System Admin'),
(23, 'Support Staff', 'Customer Support'),
(24, 'Administrator', 'System Admin'),
(25, 'Support Staff', 'Customer Support'),
(26, 'Administrator', 'System Admin'),
(27, 'Moderator', 'Content Moderation'),
(28, 'Moderator', 'Content Moderation'),
(29, 'Support Staff', 'Customer Support'),
(30, 'Administrator', 'System Admin');

-- Insert SupportStaff data
INSERT INTO `SupportStaff` (StaffID, supportChannel) VALUES 
(21, 'Email'),
(23, 'Chat'),
(25, 'Phone'),
(29, 'Email');

-- Insert ModeratorStaff data
INSERT INTO `ModeratorStaff` (StaffID, moderationContent) VALUES 
(27, 'Job Postings'),
(28, 'User Reports');

-- Insert Company data
INSERT INTO `Company` (companyID, companyName, emailAddr, phoneNum, domain, companySize, businessLicense, workingTime, taxCode, companyDesc) VALUES 
(1, 'Tech Solutions Vietnam', 'contact@techsolutions.vn', '024-1234-5678', 'IT', 100, 'BL001', '8:00-17:00', 'TAX001', 'Leading IT solutions company'),
(2, 'Creative Digital Agency', 'info@creativedigital.vn', '028-2345-6789', 'Marketing', 50, 'BL002', '8:00-17:00', 'TAX002', 'Digital marketing and design agency'),
(3, 'Cloud Services Pro', 'support@cloudpro.vn', '024-3456-7890', 'Cloud', 75, 'BL003', '8:00-17:00', 'TAX003', 'Cloud infrastructure and services'),
(4, 'Data Analytics Hub', 'hello@datahub.vn', '028-4567-8901', 'Analytics', 60, 'BL004', '8:00-17:00', 'TAX004', 'Big data and analytics solutions'),
(5, 'Mobile First Studios', 'dev@mobilefirst.vn', '031-5678-9012', 'Mobile', 40, 'BL005', '8:00-17:00', 'TAX005', 'Mobile app development company'),
(6, 'AI Innovation Lab', 'research@ailab.vn', '024-6789-0123', 'AI', 80, 'BL006', '8:00-17:00', 'TAX006', 'Artificial intelligence and ML solutions'),
(7, 'Enterprise Systems Ltd', 'sales@enterprisesys.vn', '028-7890-1234', 'Enterprise', 120, 'BL007', '8:00-17:00', 'TAX007', 'Enterprise software solutions'),
(8, 'Design Excellence Co', 'team@designexcel.vn', '024-8901-2345', 'Design', 35, 'BL008', '8:00-17:00', 'TAX008', 'UI/UX and graphic design'),
(9, 'DevOps Masters', 'ops@devopsmasters.vn', '028-9012-3456', 'DevOps', 45, 'BL009', '8:00-17:00', 'TAX009', 'DevOps consulting and services'),
(10, 'Quality First Testing', 'qa@qualityfirst.vn', '031-0123-4567', 'QA', 55, 'BL010', '8:00-17:00', 'TAX010', 'QA and testing services');

-- Insert Employer data
INSERT INTO `Employer` (EmployerID, jobTitle, department, repCompanyName, companyID, ModStaffID) VALUES 
(11, 'Recruitment Manager', 'HR', 'Tech Solutions Vietnam', 1, 27),
(12, 'HR Director', 'HR', 'Creative Digital Agency', 2, 28),
(13, 'Hiring Lead', 'HR', 'Cloud Services Pro', 3, 27),
(14, 'Talent Acquisition', 'HR', 'Data Analytics Hub', 4, 28),
(15, 'Recruitment Officer', 'HR', 'Mobile First Studios', 5, 27),
(16, 'HR Manager', 'HR', 'AI Innovation Lab', 6, 28),
(17, 'Recruiting Manager', 'HR', 'Enterprise Systems Ltd', 7, 27),
(18, 'Talent Manager', 'HR', 'Design Excellence Co', 8, 28),
(19, 'HR Lead', 'HR', 'DevOps Masters', 9, 27),
(20, 'Recruitment Lead', 'HR', 'Quality First Testing', 10, 28);

-- Insert Posting data
INSERT INTO `Posting` (postID, postName, salaryMin, salaryMax, salaryCurrency, salaryPeriod, position, location, workForm, endDate, domain, postDesc, EmployerID, ModStaffID) VALUES 
(1, 'Senior Backend Developer', 25000000, 40000000, 'VND', 'Tháng', 'Backend Developer', 'Hà Nội', 'Full-time', '2025-03-31', 'IT', 'Looking for experienced backend developer', 11, 27),
(2, 'Junior Frontend Developer', 15000000, 25000000, 'VND', 'Tháng', 'Frontend Developer', 'TP HCM', 'Full-time', '2025-02-28', 'IT', 'Entry level frontend position', 12, 28),
(3, 'DevOps Engineer', 30000000, 45000000, 'VND', 'Tháng', 'DevOps Engineer', 'Hà Nội', 'Full-time', '2025-04-30', 'IT', 'Cloud infrastructure specialist needed', 13, 27),
(4, 'Data Scientist', 28000000, 42000000, 'VND', 'Tháng', 'Data Scientist', 'TP HCM', 'Full-time', '2025-03-15', 'Analytics', 'ML and analytics expert required', 14, 28),
(5, 'iOS Developer', 20000000, 32000000, 'VND', 'Tháng', 'Mobile Developer', 'Đà Nẵng', 'Full-time', '2025-02-14', 'Mobile', 'Native iOS app developer', 15, 27),
(6, 'AI/ML Engineer', 32000000, 48000000, 'VND', 'Tháng', 'ML Engineer', 'Hà Nội', 'Full-time', '2025-05-31', 'AI', 'Deep learning and NLP specialist', 16, 28),
(7, 'Product Manager', 26000000, 38000000, 'VND', 'Tháng', 'Product Manager', 'TP HCM', 'Full-time', '2025-03-31', 'Management', 'Tech product management role', 17, 27),
(8, 'UI/UX Designer', 18000000, 28000000, 'VND', 'Tháng', 'Designer', 'Hà Nội', 'Full-time', '2025-02-28', 'Design', 'Creative design professional', 18, 28),
(9, 'QA Automation Engineer', 17000000, 27000000, 'VND', 'Tháng', 'QA Engineer', 'TP HCM', 'Full-time', '2025-03-31', 'QA', 'Test automation specialist', 19, 27),
(10, 'Full Stack Developer', 22000000, 35000000, 'VND', 'Tháng', 'Full Stack Developer', 'Hà Nội', 'Full-time', '2025-04-30', 'IT', 'MERN stack specialist', 20, 28);

-- Insert Skill data
INSERT INTO `Skill` (skillID, skillName, skillCategory) VALUES 
(1, 'Java', 'Programming Language'),
(2, 'JavaScript', 'Programming Language'),
(3, 'Python', 'Programming Language'),
(4, 'Go', 'Programming Language'),
(5, 'Rust', 'Programming Language'),
(6, 'React', 'Framework'),
(7, 'Node.js', 'Framework'),
(8, 'Spring Boot', 'Framework'),
(9, 'AWS', 'Cloud Platform'),
(10, 'Google Cloud', 'Cloud Platform'),
(11, 'Azure', 'Cloud Platform'),
(12, 'Docker', 'DevOps'),
(13, 'Kubernetes', 'DevOps'),
(14, 'Ansible', 'DevOps'),
(15, 'Figma', 'Design'),
(16, 'Adobe XD', 'Design'),
(17, 'PostgreSQL', 'Database'),
(18, 'MongoDB', 'Database'),
(19, 'Redis', 'Cache'),
(20, 'GraphQL', 'API Technology');

-- Insert Require data (linking skills to postings)
INSERT INTO `Require` (skillID, postID) VALUES 
(1, 1), (8, 1), (17, 1),
(2, 2), (6, 2), (20, 2),
(12, 3), (13, 3), (9, 3),
(3, 4), (18, 4), (17, 4),
(5, 5),
(3, 6), (1, 6),
(2, 7), (6, 7),
(15, 8), (16, 8),
(2, 9);

-- Insert Education data
INSERT INTO `Education` (CandidateID, eduID, schoolName, major, degree, startDate, endDate, Candidate_ID) VALUES 
(1, 1, 'University of Technology', 'Computer Science', 'Cấp 3', '2013-09-01', '2017-06-30', 1),
(2, 1, 'National Economics University', 'Information Technology', 'Cấp 3', '2016-09-01', '2020-06-30', 2),
(3, 1, 'Hanoi University of Science', 'Software Engineering', 'Cấp 3', '2014-09-01', '2018-06-30', 3),
(4, 1, 'FPT University', 'Digital Design', 'Cấp 3', '2016-09-01', '2020-06-30', 4),
(5, 1, 'International University of HCM', 'Data Science', 'Cấp 3', '2017-09-01', '2021-06-30', 5),
(6, 1, 'RMIT University', 'Information Systems', 'Cấp 3', '2015-09-01', '2019-06-30', 6),
(7, 1, 'University of Economics', 'Business Administration', 'Cấp 3', '2012-09-01', '2016-06-30', 7),
(8, 1, 'Ton Duc Thang University', 'Software Quality', 'Cấp 3', '2016-09-01', '2020-06-30', 8),
(9, 1, 'Can Tho University', 'Mobile Development', 'Cấp 3', '2017-09-01', '2021-06-30', 9),
(10, 1, 'University of Danang', 'Artificial Intelligence', 'Cấp 3', '2018-09-01', '2022-06-30', 10);

-- Insert ForeignLanguage data
INSERT INTO `ForeignLanguage` (CandidateID, langID, language, level, Candidate_ID) VALUES 
(1, 1, 'English', 'Thành thạo', 1),
(2, 1, 'English', 'Nâng cao', 2),
(3, 1, 'English', 'Thành thạo', 3),
(4, 1, 'French', 'Trung cấp', 4),
(5, 1, 'English', 'Nâng cao', 5),
(6, 1, 'English', 'Thành thạo', 6),
(7, 1, 'English', 'Sơ cấp', 7),
(8, 1, 'English', 'Nâng cao', 8),
(9, 1, 'English', 'Trung cấp', 9),
(10, 1, 'English', 'Thành thạo', 10);

-- Insert Certificate data
INSERT INTO `Certificate` (CandidateID, certID, certName, organization, certURL, issueDate, Candidate_ID) VALUES 
(1, 1, 'AWS Solutions Architect Associate', 'Amazon Web Services', 'https://aws.amazon.com/cert', '2023-06-15', 1),
(2, 1, 'Google UX Design Certificate', 'Google', 'https://google.com/cert', '2023-05-20', 2),
(3, 1, 'CKA Kubernetes Certification', 'Cloud Native Computing Foundation', 'https://cncf.io/cert', '2023-08-10', 3),
(4, 1, 'Adobe Certified Associate', 'Adobe', 'https://adobe.com/cert', '2023-07-05', 4),
(5, 1, 'Google Analytics Certification', 'Google', 'https://google.com/analytics', '2023-04-30', 5),
(6, 1, 'Docker Certified Associate', 'Docker', 'https://docker.com/cert', '2023-09-15', 6),
(7, 1, 'Professional Scrum Master', 'Scrum Alliance', 'https://scrum.org/cert', '2023-03-20', 7),
(8, 1, 'ISTQB Certified Tester', 'ISTQB', 'https://istqb.org/cert', '2023-06-10', 8),
(9, 1, 'Apple Developer Certification', 'Apple', 'https://apple.com/cert', '2023-05-25', 9),
(10, 1, 'TensorFlow Developer Certificate', 'Google', 'https://tensorflow.org/cert', '2023-07-30', 10);

-- Insert Experience data
INSERT INTO `Experience` (CandidateID, expID, jobTitle, CompanyName, startDate, endDate, expDesc, Candidate_ID) VALUES 
(1, 1, 'Senior Backend Developer', 'Tech Solutions Vietnam', '2020-01-15', '2023-12-31', 'Led backend team for enterprise projects', 1),
(1, 2, 'Backend Developer', 'Cloud Services Pro', '2018-06-01', '2019-12-31', 'Developed microservices architecture', 1),
(2, 1, 'Frontend Developer', 'Creative Digital Agency', '2021-03-10', '2023-12-31', 'Built responsive web applications', 2),
(2, 2, 'Junior Frontend Developer', 'Mobile First Studios', '2019-09-20', '2021-02-28', 'Assisted in mobile app development', 2),
(3, 1, 'Full Stack Developer', 'Enterprise Systems Ltd', '2019-05-01', '2023-12-31', 'Full stack development on MERN stack', 3),
(4, 1, 'UI/UX Designer', 'Design Excellence Co', '2020-02-15', '2023-12-31', 'Designed user interfaces and experiences', 4),
(5, 1, 'Data Analyst', 'Data Analytics Hub', '2021-01-10', '2023-12-31', 'Analyzed data trends and patterns', 5),
(6, 1, 'DevOps Engineer', 'DevOps Masters', '2020-07-01', '2023-12-31', 'Managed CI/CD pipelines and infrastructure', 6),
(7, 1, 'Product Manager', 'Tech Solutions Vietnam', '2019-11-15', '2023-12-31', 'Managed product roadmap and strategy', 7),
(8, 1, 'QA Engineer', 'Quality First Testing', '2020-04-20', '2023-12-31', 'Performed quality assurance testing', 8);

-- Insert TemplateCV data
INSERT INTO `TemplateCV` (templateID, templateName, ownerName, structure, font) VALUES 
(1, 'Modern Professional', 'Tech Designer', 'Two Column', 'Arial'),
(2, 'Classic Blue', 'Design Studio', 'Single Column', 'Times New Roman'),
(3, 'Minimalist White', 'White Space Design', 'Single Column', 'Helvetica'),
(4, 'Creative Colorful', 'Creative Agency', 'Multi Column', 'Verdana'),
(5, 'Executive Premium', 'Executive Design', 'Three Column', 'Garamond'),
(6, 'Tech Focused', 'Tech Designer', 'Two Column', 'Monaco'),
(7, 'Academic Standard', 'University Design', 'Single Column', 'Cambria'),
(8, 'Startup Vibes', 'Startup Studios', 'Two Column', 'Open Sans'),
(9, 'Artistic Portfolio', 'Artist Collective', 'Grid Layout', 'Raleway'),
(10, 'Corporate Clean', 'Corporate Design', 'Single Column', 'Segoe UI');

-- Insert CV data
INSERT INTO `CV` (CandidateID, cvID, cvName, cvURL, Candidate_ID) VALUES 
(1, 1, 'Nguyễn Văn A - Backend Dev', 'https://cvs.example.com/cv1.pdf', 1),
(2, 1, 'Trần Thị B - Frontend Dev', 'https://cvs.example.com/cv2.pdf', 2),
(3, 1, 'Phạm Văn C - Full Stack', 'https://cvs.example.com/cv3.pdf', 3),
(4, 1, 'Lê Thị D - UI Designer', 'https://cvs.example.com/cv4.pdf', 4),
(5, 1, 'Hoàng Văn E - Data Analyst', 'https://cvs.example.com/cv5.pdf', 5),
(6, 1, 'Vũ Thị F - DevOps Engineer', 'https://cvs.example.com/cv6.pdf', 6),
(7, 1, 'Đặng Văn G - Product Manager', 'https://cvs.example.com/cv7.pdf', 7),
(8, 1, 'Bùi Thị H - QA Engineer', 'https://cvs.example.com/cv8.pdf', 8),
(9, 1, 'Dương Văn I - Mobile Dev', 'https://cvs.example.com/cv9.pdf', 9),
(10, 1, 'Cao Thị J - ML Engineer', 'https://cvs.example.com/cv10.pdf', 10);

-- Insert BasedOn data
INSERT INTO `BasedOn` (CandidateID, cvID, templateID) VALUES 
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 6),
(7, 1, 7),
(8, 1, 8),
(9, 1, 9),
(10, 1, 10);

-- Insert Has data (skills of candidates)
INSERT INTO `Has` (CandidateID, skillID) VALUES 
(1, 1), (1, 8), (1, 17),
(2, 2), (2, 6), (2, 20),
(3, 1), (3, 2), (3, 7),
(4, 15), (4, 16),
(5, 3), (5, 17), (5, 18),
(6, 12), (6, 13), (6, 9),
(7, 2), (7, 3),
(8, 2);

-- Insert Applies data
INSERT INTO `Applies` (CandidateID, postID, applicationDate, pickCandidate) VALUES 
(1, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'pending'),
(2, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'accepted'),
(3, 3, DATE_SUB(NOW(), INTERVAL 10 DAY), 'pending'),
(4, 8, DATE_SUB(NOW(), INTERVAL 8 DAY), 'accepted'),
(5, 4, DATE_SUB(NOW(), INTERVAL 7 DAY), 'pending'),
(6, 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'accepted'),
(7, 7, DATE_SUB(NOW(), INTERVAL 4 DAY), 'pending'),
(8, 9, DATE_SUB(NOW(), INTERVAL 3 DAY), 'rejected'),
(9, 5, DATE_SUB(NOW(), INTERVAL 2 DAY), 'pending'),
(10, 6, DATE_SUB(NOW(), INTERVAL 1 DAY), 'pending'),
(1, 10, NOW(), 'pending'),
(2, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), 'rejected'),
(3, 2, DATE_SUB(NOW(), INTERVAL 18 DAY), 'pending'),
(4, 4, DATE_SUB(NOW(), INTERVAL 14 DAY), 'pending'),
(5, 7, DATE_SUB(NOW(), INTERVAL 11 DAY), 'accepted');

-- Insert Asks data
INSERT INTO `Asks` (CandidateID, StaffID, question, answer, timestamp) VALUES 
(1, 21, 'How can I update my profile?', 'You can update your profile in the settings page', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 23, 'What is the application deadline?', 'Deadlines are shown on each job posting', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 25, 'How do I contact employers?', 'You will be contacted via email if selected', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(4, 21, 'Can I edit my CV after applying?', 'Yes, you can update your CV anytime', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 23, 'How long does it take to get feedback?', 'Usually 5-7 business days', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 25, 'What skills are most in demand?', 'Check our trending skills section', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 21, 'Is there a mobile app?', 'A mobile app is coming soon', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 23, 'How do I verify my certificates?', 'Upload your certificates in the verification section', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 25, 'Can I apply to multiple positions?', 'Yes, you can apply to as many positions as you want', NOW()),
(10, 21, 'What languages are supported?', 'Currently Vietnamese and English are supported', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert Support data
INSERT INTO `Support` (EmployerID, StaffID, question, answer, timestamp) VALUES 
(11, 27, 'How do I post a job?', 'Use the job posting form in your dashboard', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(12, 28, 'How can I review applications?', 'All applications are in your Applications tab', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(13, 27, 'What is the posting cost?', 'Posting is free for all employers', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(14, 28, 'How do I message candidates?', 'Use the messaging feature on the application', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(15, 27, 'Can I edit posted jobs?', 'Yes, you can edit anytime before the deadline', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(16, 28, 'How do I verify company information?', 'Submit documents in the Company Info section', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(17, 27, 'What is the payment method?', 'We accept all major credit cards', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(18, 28, 'How do I access analytics?', 'Analytics are available in your Dashboard', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(19, 27, 'Can I schedule interviews?', 'Interview scheduling is available in the app', NOW()),
(20, 28, 'How do I report candidates?', 'Use the Report button on the candidate profile', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert Message data
INSERT INTO `Message` (userID, other_userID) VALUES 
(1, 11), (2, 12), (3, 13), (4, 14), (5, 15),
(6, 16), (7, 17), (8, 18), (9, 19), (10, 20);

-- Insert SendTime data
INSERT INTO `SendTime` (userID, other_userID, sendTime) VALUES 
(1, 11, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2, 12, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 13, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 14, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 15, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 16, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 17, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 18, NOW()),
(9, 19, NOW()),
(10, 20, NOW());

-- Insert Content data
INSERT INTO `Content` (userID, other_userID, content) VALUES 
(1, 11, 'Hello, I am interested in your job posting'),
(2, 12, 'Thank you for applying to our company'),
(3, 13, 'Can you tell me more about your experience?'),
(4, 14, 'I have 5 years of experience in backend development'),
(5, 15, 'That sounds great, let us schedule an interview'),
(6, 16, 'What time works best for you?'),
(7, 17, 'Next Monday at 2 PM would be perfect'),
(8, 18, 'We will send you a confirmation email'),
(9, 19, 'Looking forward to speaking with you'),
(10, 20, 'Thank you, see you soon!');

-- Insert Status data
INSERT INTO `Status` (userID, other_userID, status) VALUES 
(1, 11, 'Đã đọc'),
(2, 12, 'Đã đọc'),
(3, 13, 'Đã đọc'),
(4, 14, 'Đã đọc'),
(5, 15, 'Đã đọc'),
(6, 16, 'Đã đọc'),
(7, 17, 'Chưa đọc'),
(8, 18, 'Chưa đọc'),
(9, 19, 'Chưa đọc'),
(10, 20, 'Chưa đọc');

-- Insert socialLink data
INSERT INTO `socialLink` (socialLinkName, CandidateID) VALUES 
('LinkedIn', 1), ('GitHub', 2), ('LinkedIn', 3), ('Behance', 4), ('LinkedIn', 5),
('GitHub', 6), ('LinkedIn', 7), ('GitHub', 8), ('LinkedIn', 9), ('GitHub', 10);

-- Insert color data
INSERT INTO `color` (colorID, templateID) VALUES 
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

-- Insert companyAddr data
INSERT INTO `companyAddr` (companyAddrID, companyID, addrLine) VALUES 
(1, 1, '123 Đại lộ Thăng Long, Hà Nội'),
(2, 2, '456 Nguyễn Huệ, TP HCM'),
(3, 3, '789 Trần Hưng Đạo, Hà Nội'),
(4, 4, '321 Lê Lợi, TP HCM'),
(5, 5, '654 Hoàn Kiếm, Hà Nội'),
(6, 6, '987 Đống Đa, Hà Nội'),
(7, 7, '147 Phạm Ngũ Lão, TP HCM'),
(8, 8, '258 Cầu Giấy, Hà Nội'),
(9, 9, '369 Bế Văn Đàn, TP HCM'),
(10, 10, '741 Trần Phú, Đà Nẵng');

-- Insert companyURL data
INSERT INTO `companyURL` (companyURLID, companyID, url) VALUES 
(1, 1, 'https://techsolutions.vn'),
(2, 2, 'https://creativedigital.vn'),
(3, 3, 'https://cloudpro.vn'),
(4, 4, 'https://datahub.vn'),
(5, 5, 'https://mobilefirst.vn'),
(6, 6, 'https://ailab.vn'),
(7, 7, 'https://enterprisesys.vn'),
(8, 8, 'https://designexcel.vn'),
(9, 9, 'https://devopsmasters.vn'),
(10, 10, 'https://qualityfirst.vn');

SET FOREIGN_KEY_CHECKS = 1;
