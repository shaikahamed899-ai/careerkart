// Pagination helper
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// Build pagination response
const paginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Build filter query for jobs
const buildJobFilterQuery = (filters) => {
  const query = { status: 'active' };
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters.employmentType) {
    query.employmentType = Array.isArray(filters.employmentType)
      ? { $in: filters.employmentType }
      : filters.employmentType;
  }
  
  if (filters.workMode) {
    query.workMode = Array.isArray(filters.workMode)
      ? { $in: filters.workMode }
      : filters.workMode;
  }
  
  if (filters.location) {
    query['location.city'] = { $regex: filters.location, $options: 'i' };
  }
  
  if (filters.industry) {
    query.industry = filters.industry;
  }
  
  if (filters.department) {
    query.department = filters.department;
  }
  
  if (filters.experienceMin !== undefined || filters.experienceMax !== undefined) {
    query['experience.min'] = {};
    if (filters.experienceMin !== undefined) {
      query['experience.min'].$gte = parseInt(filters.experienceMin);
    }
    if (filters.experienceMax !== undefined) {
      query['experience.min'].$lte = parseInt(filters.experienceMax);
    }
  }
  
  if (filters.salaryMin !== undefined || filters.salaryMax !== undefined) {
    if (filters.salaryMin !== undefined) {
      query['salary.min'] = { $gte: parseInt(filters.salaryMin) };
    }
    if (filters.salaryMax !== undefined) {
      query['salary.max'] = { $lte: parseInt(filters.salaryMax) };
    }
  }
  
  if (filters.skills && filters.skills.length > 0) {
    const skillsArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
    query['skills.name'] = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
  }
  
  if (filters.company) {
    query.company = filters.company;
  }
  
  if (filters.postedWithin) {
    const days = parseInt(filters.postedWithin);
    const date = new Date();
    date.setDate(date.getDate() - days);
    query.postedAt = { $gte: date };
  }
  
  return query;
};

// Build sort query
const buildSortQuery = (sortBy) => {
  const sortOptions = {
    newest: { postedAt: -1 },
    oldest: { postedAt: 1 },
    salary_high: { 'salary.max': -1 },
    salary_low: { 'salary.min': 1 },
    relevance: { score: { $meta: 'textScore' } },
  };
  
  return sortOptions[sortBy] || sortOptions.newest;
};

// Sanitize user object for response
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshTokens;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.loginHistory;
  delete userObj.__v;
  return userObj;
};

// Format salary for display
const formatSalary = (amount, currency = 'INR') => {
  if (!amount) return 'Not disclosed';
  
  if (currency === 'INR') {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} LPA`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate match score between job and user
const calculateMatchScore = (job, user) => {
  let score = 0;
  let maxScore = 0;
  
  // Skills match (40%)
  if (job.skills && user.profile?.skills) {
    maxScore += 40;
    const jobSkills = job.skills.map(s => s.name.toLowerCase());
    const userSkills = user.profile.skills.map(s => s.name.toLowerCase());
    const matchedSkills = jobSkills.filter(s => userSkills.includes(s));
    score += (matchedSkills.length / jobSkills.length) * 40;
  }
  
  // Experience match (30%)
  if (job.experience && user.profile?.totalExperience) {
    maxScore += 30;
    const userExp = user.profile.totalExperience.years + (user.profile.totalExperience.months / 12);
    if (userExp >= job.experience.min && (!job.experience.max || userExp <= job.experience.max)) {
      score += 30;
    } else if (userExp >= job.experience.min - 1) {
      score += 15;
    }
  }
  
  // Location match (15%)
  if (job.location?.city && user.profile?.location?.city) {
    maxScore += 15;
    if (job.location.city.toLowerCase() === user.profile.location.city.toLowerCase()) {
      score += 15;
    } else if (job.workMode === 'remote') {
      score += 15;
    }
  }
  
  // Education match (15%)
  if (job.education && user.education?.length > 0) {
    maxScore += 15;
    // Simplified education matching
    score += 10;
  }
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

// Generate slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Time ago helper
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};

module.exports = {
  paginate,
  paginationResponse,
  buildJobFilterQuery,
  buildSortQuery,
  sanitizeUser,
  formatSalary,
  calculateMatchScore,
  generateSlug,
  timeAgo,
};
