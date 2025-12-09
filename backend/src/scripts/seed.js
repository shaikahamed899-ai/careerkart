require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

const seedData = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create demo users
    const hashedPassword = await bcrypt.hash('Demo@123', 12);
    
    const demoUser = await User.create({
      email: 'demo@careerkart.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'job_seeker',
      isEmailVerified: true,
      isOnboarded: true,
      authProvider: 'local',
      profile: {
        headline: 'Full Stack Developer | React | Node.js',
        summary: 'Passionate developer with 3+ years of experience in building web applications.',
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        totalExperience: { years: 3, months: 6 },
        skills: [
          { name: 'JavaScript', level: 'advanced' },
          { name: 'React', level: 'advanced' },
          { name: 'Node.js', level: 'intermediate' },
          { name: 'MongoDB', level: 'intermediate' },
          { name: 'TypeScript', level: 'intermediate' },
        ],
        expectedSalary: { min: 1500000, max: 2500000 },
        noticePeriod: '1_month',
      },
      education: [{
        institution: 'Indian Institute of Technology',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2016-08-01'),
        endDate: new Date('2020-05-01'),
        grade: '8.5 CGPA',
      }],
      experience: [{
        company: 'Tech Solutions Pvt Ltd',
        title: 'Software Developer',
        employmentType: 'full_time',
        location: 'Bangalore',
        startDate: new Date('2020-06-01'),
        isCurrent: true,
        description: 'Building scalable web applications using React and Node.js',
        skills: ['React', 'Node.js', 'MongoDB'],
      }],
      preferences: {
        jobAlerts: true,
        emailNotifications: true,
        preferredJobTypes: ['full_time', 'remote'],
        preferredLocations: ['Bangalore', 'Remote'],
      },
      profileCompletion: 85,
    });

    const employerUser = await User.create({
      email: 'employer@careerkart.com',
      password: hashedPassword,
      name: 'HR Manager',
      role: 'employer',
      isEmailVerified: true,
      isOnboarded: true,
      authProvider: 'local',
      employer: {
        designation: 'HR Manager',
        department: 'Human Resources',
        isVerified: true,
      },
    });

    console.log('Created demo users');

    // Create companies
    const companies = await Company.create([
      {
        name: 'TechCorp India',
        slug: 'techcorp-india',
        description: 'Leading technology company specializing in enterprise software solutions.',
        shortDescription: 'Enterprise software solutions provider',
        industry: 'Information Technology',
        companyType: 'mnc',
        companySize: '1001-5000',
        foundedYear: 2005,
        website: 'https://techcorp.example.com',
        headquarters: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        locations: [
          { city: 'Bangalore', state: 'Karnataka', country: 'India', isHeadquarters: true },
          { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
          { city: 'Hyderabad', state: 'Telangana', country: 'India' },
        ],
        techStack: ['React', 'Node.js', 'Python', 'AWS', 'Kubernetes'],
        ratings: { overall: 4.2, workLifeBalance: 4.0, salaryBenefits: 4.3, careerGrowth: 4.1, culture: 4.2, totalReviews: 150 },
        benefits: [
          { category: 'health', name: 'Health Insurance', description: 'Comprehensive health coverage' },
          { category: 'financial', name: 'Stock Options', description: 'Employee stock purchase plan' },
          { category: 'lifestyle', name: 'Remote Work', description: 'Flexible work from home policy' },
        ],
        admins: [{ user: employerUser._id, role: 'owner' }],
        isVerified: true,
        followersCount: 5000,
      },
      {
        name: 'StartupX',
        slug: 'startupx',
        description: 'Fast-growing startup disrupting the fintech space.',
        shortDescription: 'Fintech startup',
        industry: 'Finance & Banking',
        companyType: 'startup',
        companySize: '51-200',
        foundedYear: 2019,
        website: 'https://startupx.example.com',
        headquarters: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        techStack: ['React Native', 'Go', 'PostgreSQL', 'GCP'],
        ratings: { overall: 4.5, workLifeBalance: 4.3, salaryBenefits: 4.6, careerGrowth: 4.7, culture: 4.5, totalReviews: 45 },
        isVerified: true,
        followersCount: 1200,
      },
      {
        name: 'Global Consulting Group',
        slug: 'global-consulting-group',
        description: 'Top-tier management consulting firm with global presence.',
        shortDescription: 'Management consulting',
        industry: 'Consulting',
        companyType: 'mnc',
        companySize: '5001-10000',
        foundedYear: 1990,
        headquarters: { city: 'Delhi NCR', state: 'Delhi', country: 'India' },
        ratings: { overall: 4.0, workLifeBalance: 3.5, salaryBenefits: 4.5, careerGrowth: 4.3, culture: 3.8, totalReviews: 300 },
        isVerified: true,
        followersCount: 8000,
      },
    ]);

    // Update employer with company
    employerUser.employer.companyId = companies[0]._id;
    await employerUser.save();

    console.log('Created companies');

    // Create jobs
    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Developer',
        company: companies[0]._id,
        postedBy: employerUser._id,
        description: `We are looking for a Senior Full Stack Developer to join our growing team.

**Responsibilities:**
- Design and develop scalable web applications
- Mentor junior developers
- Participate in code reviews
- Collaborate with product and design teams

**Requirements:**
- 5+ years of experience in full stack development
- Strong proficiency in React and Node.js
- Experience with cloud services (AWS/GCP)
- Excellent problem-solving skills`,
        shortDescription: 'Join our team as a Senior Full Stack Developer and build amazing products.',
        responsibilities: [
          'Design and develop scalable web applications',
          'Mentor junior developers',
          'Participate in code reviews',
          'Collaborate with product and design teams',
        ],
        requirements: [
          '5+ years of experience in full stack development',
          'Strong proficiency in React and Node.js',
          'Experience with cloud services (AWS/GCP)',
          'Excellent problem-solving skills',
        ],
        employmentType: 'full_time',
        workMode: 'hybrid',
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        experience: { min: 5, max: 10 },
        salary: { min: 2500000, max: 4000000, currency: 'INR', period: 'yearly', showSalary: true },
        skills: [
          { name: 'React', isRequired: true },
          { name: 'Node.js', isRequired: true },
          { name: 'TypeScript', isRequired: false },
          { name: 'AWS', isRequired: false },
          { name: 'MongoDB', isRequired: true },
        ],
        education: { minQualification: 'graduate' },
        industry: 'Information Technology',
        department: 'Engineering',
        openings: 3,
        status: 'active',
        tags: ['react', 'nodejs', 'fullstack', 'senior'],
      },
      {
        title: 'Frontend Developer',
        company: companies[0]._id,
        postedBy: employerUser._id,
        description: 'Looking for a passionate Frontend Developer to create beautiful user interfaces.',
        employmentType: 'full_time',
        workMode: 'remote',
        location: { city: 'Remote', isRemote: true },
        experience: { min: 2, max: 5 },
        salary: { min: 1200000, max: 2000000, currency: 'INR', period: 'yearly', showSalary: true },
        skills: [
          { name: 'React', isRequired: true },
          { name: 'CSS', isRequired: true },
          { name: 'JavaScript', isRequired: true },
        ],
        industry: 'Information Technology',
        department: 'Engineering',
        openings: 2,
        status: 'active',
      },
      {
        title: 'Backend Engineer',
        company: companies[1]._id,
        postedBy: employerUser._id,
        description: 'Join our backend team to build scalable APIs and microservices.',
        employmentType: 'full_time',
        workMode: 'onsite',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        experience: { min: 3, max: 7 },
        salary: { min: 1800000, max: 3000000, currency: 'INR', period: 'yearly', showSalary: true },
        skills: [
          { name: 'Go', isRequired: true },
          { name: 'PostgreSQL', isRequired: true },
          { name: 'Docker', isRequired: false },
        ],
        industry: 'Finance & Banking',
        department: 'Engineering',
        openings: 1,
        status: 'active',
      },
      {
        title: 'Product Manager',
        company: companies[0]._id,
        postedBy: employerUser._id,
        description: 'Lead product strategy and roadmap for our enterprise products.',
        employmentType: 'full_time',
        workMode: 'hybrid',
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        experience: { min: 4, max: 8 },
        salary: { min: 2000000, max: 3500000, currency: 'INR', period: 'yearly', showSalary: true },
        skills: [
          { name: 'Product Management', isRequired: true },
          { name: 'Agile', isRequired: true },
          { name: 'Data Analysis', isRequired: false },
        ],
        industry: 'Information Technology',
        department: 'Product',
        openings: 1,
        status: 'active',
      },
      {
        title: 'Data Scientist',
        company: companies[1]._id,
        postedBy: employerUser._id,
        description: 'Apply machine learning to solve complex fintech problems.',
        employmentType: 'full_time',
        workMode: 'hybrid',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        experience: { min: 2, max: 6 },
        salary: { min: 1500000, max: 2800000, currency: 'INR', period: 'yearly', showSalary: true },
        skills: [
          { name: 'Python', isRequired: true },
          { name: 'Machine Learning', isRequired: true },
          { name: 'SQL', isRequired: true },
        ],
        industry: 'Finance & Banking',
        department: 'Data Science',
        openings: 2,
        status: 'active',
      },
      {
        title: 'Business Analyst',
        company: companies[2]._id,
        postedBy: employerUser._id,
        description: 'Work with clients to solve complex business challenges.',
        employmentType: 'full_time',
        workMode: 'onsite',
        location: { city: 'Delhi NCR', state: 'Delhi', country: 'India' },
        experience: { min: 1, max: 4 },
        salary: { min: 1000000, max: 1800000, currency: 'INR', period: 'yearly', showSalary: true },
        skills: [
          { name: 'Business Analysis', isRequired: true },
          { name: 'Excel', isRequired: true },
          { name: 'PowerPoint', isRequired: true },
        ],
        industry: 'Consulting',
        department: 'Consulting',
        openings: 5,
        status: 'active',
      },
    ]);

    console.log('Created jobs');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Job Seeker: demo@careerkart.com / Demo@123');
    console.log('Employer: employer@careerkart.com / Demo@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
