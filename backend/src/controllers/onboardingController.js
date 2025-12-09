const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { sanitizeUser } = require('../utils/helpers');

// Onboarding questions configuration
const onboardingQuestions = {
  fresher: [
    {
      step: 1,
      id: 'education',
      title: 'Education Details',
      description: 'Tell us about your educational background',
      fields: [
        { name: 'highestQualification', type: 'select', label: 'Highest Qualification', required: true, options: ['10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'PhD'] },
        { name: 'institution', type: 'text', label: 'Institution Name', required: true },
        { name: 'fieldOfStudy', type: 'text', label: 'Field of Study', required: true },
        { name: 'graduationYear', type: 'number', label: 'Graduation Year', required: true },
        { name: 'grade', type: 'text', label: 'Grade/CGPA', required: false },
      ],
    },
    {
      step: 2,
      id: 'skills',
      title: 'Your Skills',
      description: 'What skills do you have?',
      fields: [
        { name: 'skills', type: 'multi-select', label: 'Select your skills', required: true, options: [] }, // Dynamic options
        { name: 'otherSkills', type: 'tags', label: 'Add other skills', required: false },
      ],
    },
    {
      step: 3,
      id: 'preferences',
      title: 'Job Preferences',
      description: 'What kind of job are you looking for?',
      fields: [
        { name: 'preferredJobTypes', type: 'multi-select', label: 'Job Type', required: true, options: ['Full Time', 'Part Time', 'Internship', 'Freelance'] },
        { name: 'preferredLocations', type: 'multi-select', label: 'Preferred Locations', required: true, options: [] },
        { name: 'expectedSalary', type: 'range', label: 'Expected Salary (LPA)', required: false, min: 0, max: 50 },
        { name: 'preferredIndustries', type: 'multi-select', label: 'Preferred Industries', required: false, options: [] },
      ],
    },
    {
      step: 4,
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add some final details',
      fields: [
        { name: 'headline', type: 'text', label: 'Professional Headline', required: false, placeholder: 'e.g., Fresh Graduate | Computer Science | Looking for Software Developer Role' },
        { name: 'summary', type: 'textarea', label: 'About You', required: false, placeholder: 'Write a brief summary about yourself...' },
        { name: 'phone', type: 'tel', label: 'Phone Number', required: true },
        { name: 'location', type: 'location', label: 'Current Location', required: true },
      ],
    },
  ],
  experienced: [
    {
      step: 1,
      id: 'experience',
      title: 'Work Experience',
      description: 'Tell us about your work experience',
      fields: [
        { name: 'totalExperience', type: 'experience', label: 'Total Experience', required: true },
        { name: 'currentCompany', type: 'text', label: 'Current/Last Company', required: true },
        { name: 'currentRole', type: 'text', label: 'Current/Last Role', required: true },
        { name: 'currentSalary', type: 'number', label: 'Current/Last Salary (LPA)', required: false },
        { name: 'noticePeriod', type: 'select', label: 'Notice Period', required: true, options: ['Immediate', '15 Days', '1 Month', '2 Months', '3 Months', 'More than 3 Months'] },
      ],
    },
    {
      step: 2,
      id: 'skills',
      title: 'Your Skills',
      description: 'What are your key skills?',
      fields: [
        { name: 'skills', type: 'skill-level', label: 'Add your skills with proficiency', required: true },
      ],
    },
    {
      step: 3,
      id: 'preferences',
      title: 'Job Preferences',
      description: 'What are you looking for?',
      fields: [
        { name: 'preferredJobTypes', type: 'multi-select', label: 'Job Type', required: true, options: ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Remote'] },
        { name: 'preferredLocations', type: 'multi-select', label: 'Preferred Locations', required: true, options: [] },
        { name: 'expectedSalary', type: 'range', label: 'Expected Salary (LPA)', required: true, min: 0, max: 100 },
        { name: 'preferredIndustries', type: 'multi-select', label: 'Preferred Industries', required: false, options: [] },
      ],
    },
    {
      step: 4,
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Final touches to your profile',
      fields: [
        { name: 'headline', type: 'text', label: 'Professional Headline', required: true, placeholder: 'e.g., Senior Software Engineer | 5+ Years Experience | Full Stack Developer' },
        { name: 'summary', type: 'textarea', label: 'Professional Summary', required: false },
        { name: 'phone', type: 'tel', label: 'Phone Number', required: true },
        { name: 'linkedIn', type: 'url', label: 'LinkedIn Profile', required: false },
      ],
    },
  ],
  employer: [
    {
      step: 1,
      id: 'company',
      title: 'Company Information',
      description: 'Tell us about your company',
      fields: [
        { name: 'companyName', type: 'text', label: 'Company Name', required: true },
        { name: 'industry', type: 'select', label: 'Industry', required: true, options: [] },
        { name: 'companySize', type: 'select', label: 'Company Size', required: true, options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'] },
        { name: 'website', type: 'url', label: 'Company Website', required: false },
      ],
    },
    {
      step: 2,
      id: 'contact',
      title: 'Contact Information',
      description: 'How can candidates reach you?',
      fields: [
        { name: 'designation', type: 'text', label: 'Your Designation', required: true },
        { name: 'department', type: 'text', label: 'Department', required: false },
        { name: 'phone', type: 'tel', label: 'Contact Number', required: true },
        { name: 'hrEmail', type: 'email', label: 'HR Email', required: false },
      ],
    },
    {
      step: 3,
      id: 'location',
      title: 'Company Location',
      description: 'Where is your company located?',
      fields: [
        { name: 'headquarters', type: 'location', label: 'Headquarters', required: true },
        { name: 'otherLocations', type: 'multi-location', label: 'Other Office Locations', required: false },
      ],
    },
  ],
};

// Get onboarding questions
exports.getOnboardingQuestions = async (req, res, next) => {
  try {
    const { userType } = req.query;
    
    if (!userType || !onboardingQuestions[userType]) {
      throw new AppError('Invalid user type', 400, 'INVALID_USER_TYPE');
    }
    
    res.json({
      success: true,
      data: {
        userType,
        totalSteps: onboardingQuestions[userType].length,
        questions: onboardingQuestions[userType],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's onboarding status
exports.getOnboardingStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        isOnboarded: user.isOnboarded,
        onboarding: user.onboarding,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Set user type (first step)
exports.setUserType = async (req, res, next) => {
  try {
    const { userType } = req.body;
    
    if (!['fresher', 'experienced', 'employer'].includes(userType)) {
      throw new AppError('Invalid user type', 400, 'INVALID_USER_TYPE');
    }
    
    const user = await User.findById(req.user._id);
    
    // Set role based on user type
    if (userType === 'employer') {
      user.role = 'employer';
    } else {
      user.role = 'job_seeker';
    }
    
    user.onboarding = {
      userType,
      currentStep: 1,
      completedSteps: [0],
      answers: new Map(),
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User type set successfully',
      data: {
        userType,
        questions: onboardingQuestions[userType],
        currentStep: 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Save onboarding step
exports.saveOnboardingStep = async (req, res, next) => {
  try {
    const { step, answers } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user.onboarding?.userType) {
      throw new AppError('Please select user type first', 400, 'USER_TYPE_NOT_SET');
    }
    
    const userType = user.onboarding.userType;
    const questions = onboardingQuestions[userType];
    const totalSteps = questions.length;
    
    if (step < 1 || step > totalSteps) {
      throw new AppError('Invalid step', 400, 'INVALID_STEP');
    }
    
    // Save answers for this step
    const currentQuestion = questions.find(q => q.step === step);
    if (currentQuestion) {
      user.onboarding.answers.set(currentQuestion.id, answers);
    }
    
    // Mark step as completed
    if (!user.onboarding.completedSteps.includes(step)) {
      user.onboarding.completedSteps.push(step);
    }
    
    // Move to next step
    user.onboarding.currentStep = Math.min(step + 1, totalSteps);
    
    // Apply answers to user profile based on step
    await applyOnboardingAnswers(user, currentQuestion?.id, answers);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Step saved successfully',
      data: {
        currentStep: user.onboarding.currentStep,
        completedSteps: user.onboarding.completedSteps,
        isLastStep: step === totalSteps,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Complete onboarding
exports.completeOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.onboarding?.userType) {
      throw new AppError('Please complete onboarding steps', 400, 'ONBOARDING_INCOMPLETE');
    }
    
    const userType = user.onboarding.userType;
    const totalSteps = onboardingQuestions[userType].length;
    
    // Check if all steps are completed
    const completedSteps = user.onboarding.completedSteps.filter(s => s > 0);
    if (completedSteps.length < totalSteps) {
      throw new AppError('Please complete all onboarding steps', 400, 'ONBOARDING_INCOMPLETE');
    }
    
    user.isOnboarded = true;
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Skip onboarding
exports.skipOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.isOnboarded = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding skipped',
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to apply onboarding answers to user profile
async function applyOnboardingAnswers(user, stepId, answers) {
  switch (stepId) {
    case 'education':
      if (answers.institution) {
        user.education = [{
          institution: answers.institution,
          degree: answers.highestQualification,
          fieldOfStudy: answers.fieldOfStudy,
          endDate: new Date(answers.graduationYear, 0, 1),
          grade: answers.grade,
        }];
      }
      break;
      
    case 'experience':
      if (answers.currentCompany) {
        user.experience = [{
          company: answers.currentCompany,
          title: answers.currentRole,
          isCurrent: true,
        }];
        user.profile.totalExperience = {
          years: answers.totalExperience?.years || 0,
          months: answers.totalExperience?.months || 0,
        };
        user.profile.currentSalary = {
          amount: answers.currentSalary ? answers.currentSalary * 100000 : undefined,
        };
        user.profile.noticePeriod = answers.noticePeriod?.toLowerCase().replace(/ /g, '_');
      }
      break;
      
    case 'skills':
      if (answers.skills) {
        user.profile.skills = answers.skills.map(skill => ({
          name: typeof skill === 'string' ? skill : skill.name,
          level: typeof skill === 'string' ? 'intermediate' : skill.level,
        }));
      }
      break;
      
    case 'preferences':
      user.preferences = {
        ...user.preferences,
        preferredJobTypes: answers.preferredJobTypes?.map(t => t.toLowerCase().replace(/ /g, '_')),
        preferredLocations: answers.preferredLocations,
        preferredIndustries: answers.preferredIndustries,
      };
      if (answers.expectedSalary) {
        user.profile.expectedSalary = {
          min: answers.expectedSalary.min * 100000,
          max: answers.expectedSalary.max * 100000,
        };
      }
      break;
      
    case 'profile':
      if (answers.headline) user.profile.headline = answers.headline;
      if (answers.summary) user.profile.summary = answers.summary;
      if (answers.phone) user.phone = answers.phone;
      if (answers.location) {
        user.profile.location = {
          city: answers.location.city,
          state: answers.location.state,
          country: answers.location.country || 'India',
        };
      }
      if (answers.linkedIn) {
        user.profile.socialLinks = {
          ...user.profile.socialLinks,
          linkedin: answers.linkedIn,
        };
      }
      break;
      
    case 'company':
      // Company creation will be handled separately
      user.employer = {
        ...user.employer,
        isVerified: false,
      };
      break;
      
    case 'contact':
      if (answers.designation) user.employer.designation = answers.designation;
      if (answers.department) user.employer.department = answers.department;
      if (answers.phone) user.phone = answers.phone;
      break;
  }
}

// Get dropdown options for onboarding
exports.getOnboardingOptions = async (req, res, next) => {
  try {
    const skills = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue.js',
      'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis',
      'Project Management', 'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
    ];
    
    const locations = [
      'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
      'Ahmedabad', 'Jaipur', 'Lucknow', 'Remote',
    ];
    
    const industries = [
      'Information Technology', 'Finance & Banking', 'Healthcare', 'E-commerce',
      'Education', 'Manufacturing', 'Consulting', 'Media & Entertainment',
      'Telecommunications', 'Real Estate', 'Automotive', 'Retail',
    ];
    
    res.json({
      success: true,
      data: {
        skills,
        locations,
        industries,
      },
    });
  } catch (error) {
    next(error);
  }
};
