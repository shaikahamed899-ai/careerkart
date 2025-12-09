const Company = require('../models/Company');
const Job = require('../models/Job');
const Review = require('../models/Review');
const Salary = require('../models/Salary');
const { InterviewExperience } = require('../models/Interview');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { paginationResponse } = require('../utils/helpers');
const { uploadCompanyLogo, uploadCompanyCover, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all companies
exports.getCompanies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      industry,
      companySize,
      location,
      sortBy = 'popular',
    } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (industry) {
      query.industry = industry;
    }
    
    if (companySize) {
      query.companySize = companySize;
    }
    
    if (location) {
      query['headquarters.city'] = { $regex: location, $options: 'i' };
    }
    
    const sortOptions = {
      popular: { followersCount: -1 },
      rating: { 'ratings.overall': -1 },
      newest: { createdAt: -1 },
      alphabetical: { name: 1 },
    };
    
    const [companies, total] = await Promise.all([
      Company.find(query)
        .select('name slug logo industry companySize headquarters ratings followersCount')
        .sort(sortOptions[sortBy] || sortOptions.popular)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Company.countDocuments(query),
    ]);
    
    // Add active jobs count
    const companiesWithJobs = await Promise.all(
      companies.map(async (company) => {
        const jobsCount = await Job.countDocuments({
          company: company._id,
          status: 'active',
        });
        return { ...company, activeJobsCount: jobsCount };
      })
    );
    
    res.json({
      success: true,
      ...paginationResponse(companiesWithJobs, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get company by slug or ID
exports.getCompany = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    
    const company = await Company.findOne({ ...query, isActive: true })
      .populate('admins.user', 'name avatar');
    
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    // Get additional stats
    const [activeJobsCount, reviewsCount, salariesCount, interviewsCount] = await Promise.all([
      Job.countDocuments({ company: company._id, status: 'active' }),
      Review.countDocuments({ company: company._id, status: 'approved' }),
      Salary.countDocuments({ company: company._id, status: 'approved' }),
      InterviewExperience.countDocuments({ company: company._id, status: 'approved' }),
    ]);
    
    // Check if user is following
    let isFollowing = false;
    if (req.user) {
      isFollowing = req.user.followingCompanies?.includes(company._id);
    }
    
    res.json({
      success: true,
      data: {
        ...company.toObject(),
        activeJobsCount,
        reviewsCount,
        salariesCount,
        interviewsCount,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get company jobs
exports.getCompanyJobs = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    
    const company = await Company.findOne(query);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const [jobs, total] = await Promise.all([
      Job.find({ company: company._id, status: 'active' })
        .select('title location employmentType workMode experience salary postedAt')
        .sort({ postedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Job.countDocuments({ company: company._id, status: 'active' }),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(jobs, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get company reviews
exports.getCompanyReviews = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
    
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    
    const company = await Company.findOne(query);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { 'ratings.overall': -1 },
      lowest: { 'ratings.overall': 1 },
      helpful: { helpful: -1 },
    };
    
    const [reviews, total] = await Promise.all([
      Review.find({ company: company._id, status: 'approved' })
        .select('-user')
        .sort(sortOptions[sortBy] || sortOptions.newest)
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Review.countDocuments({ company: company._id, status: 'approved' }),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(reviews, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get company salaries
exports.getCompanySalaries = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { page = 1, limit = 10, jobTitle } = req.query;
    
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    
    const company = await Company.findOne(query);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const salaryQuery = { company: company._id, status: 'approved' };
    if (jobTitle) {
      salaryQuery.jobTitle = { $regex: jobTitle, $options: 'i' };
    }
    
    // Get salary statistics grouped by job title
    const salaryStats = await Salary.aggregate([
      { $match: salaryQuery },
      {
        $group: {
          _id: '$jobTitle',
          avgSalary: { $avg: '$baseSalary.amount' },
          minSalary: { $min: '$baseSalary.amount' },
          maxSalary: { $max: '$baseSalary.amount' },
          count: { $sum: 1 },
          avgExperience: { $avg: '$totalExperience' },
        },
      },
      { $sort: { count: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);
    
    const total = await Salary.aggregate([
      { $match: salaryQuery },
      { $group: { _id: '$jobTitle' } },
      { $count: 'total' },
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(
        salaryStats,
        total[0]?.total || 0,
        parseInt(page),
        parseInt(limit)
      ),
    });
  } catch (error) {
    next(error);
  }
};

// Get company interviews
exports.getCompanyInterviews = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { page = 1, limit = 10, jobTitle } = req.query;
    
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    
    const company = await Company.findOne(query);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const interviewQuery = { company: company._id, status: 'approved' };
    if (jobTitle) {
      interviewQuery.jobTitle = { $regex: jobTitle, $options: 'i' };
    }
    
    const [interviews, total] = await Promise.all([
      InterviewExperience.find(interviewQuery)
        .select('-user')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      InterviewExperience.countDocuments(interviewQuery),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(interviews, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Follow/unfollow company
exports.toggleFollowCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const user = await User.findById(req.user._id);
    const isFollowing = user.followingCompanies.includes(id);
    
    if (isFollowing) {
      user.followingCompanies.pull(id);
      company.followers.pull(req.user._id);
      company.followersCount = Math.max(0, company.followersCount - 1);
    } else {
      user.followingCompanies.push(id);
      company.followers.push(req.user._id);
      company.followersCount += 1;
    }
    
    await Promise.all([user.save(), company.save()]);
    
    res.json({
      success: true,
      message: isFollowing ? 'Unfollowed company' : 'Following company',
      data: { isFollowing: !isFollowing },
    });
  } catch (error) {
    next(error);
  }
};

// Submit review
exports.submitReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      company: id,
      user: req.user._id,
    });
    
    if (existingReview) {
      throw new AppError('You have already reviewed this company', 400, 'ALREADY_REVIEWED');
    }
    
    const review = new Review({
      ...req.body,
      company: id,
      user: req.user._id,
    });
    
    await review.save();
    
    res.status(201).json({
      success: true,
      message: 'Review submitted for approval',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Submit salary
exports.submitSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const salary = new Salary({
      ...req.body,
      company: id,
      user: req.user._id,
    });
    
    await salary.save();
    
    res.status(201).json({
      success: true,
      message: 'Salary submitted for approval',
      data: salary,
    });
  } catch (error) {
    next(error);
  }
};

// Submit interview experience
exports.submitInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    
    const interview = new InterviewExperience({
      ...req.body,
      company: id,
      user: req.user._id,
    });
    
    await interview.save();
    
    res.status(201).json({
      success: true,
      message: 'Interview experience submitted for approval',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// ============ EMPLOYER ROUTES ============

// Create company (Employer)
exports.createCompany = async (req, res, next) => {
  try {
    const existingCompany = await Company.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
    });
    
    if (existingCompany) {
      throw new AppError('Company with this name already exists', 400, 'COMPANY_EXISTS');
    }
    
    const company = new Company({
      ...req.body,
      admins: [{
        user: req.user._id,
        role: 'owner',
      }],
    });
    
    await company.save();
    
    // Update user's employer info
    await User.findByIdAndUpdate(req.user._id, {
      'employer.companyId': company._id,
    });
    
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// Update company (Employer)
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      _id: req.user.employer?.companyId,
      'admins.user': req.user._id,
    });
    
    if (!company) {
      throw new AppError('Company not found or unauthorized', 404, 'NOT_FOUND');
    }
    
    const allowedUpdates = [
      'description', 'shortDescription', 'industry', 'companyType',
      'companySize', 'foundedYear', 'website', 'headquarters', 'locations',
      'contact', 'socialLinks', 'culture', 'benefits', 'techStack',
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });
    
    await company.save();
    
    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// Upload company logo
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload an image', 400, 'NO_FILE');
    }
    
    const company = await Company.findOne({
      _id: req.user.employer?.companyId,
      'admins.user': req.user._id,
    });
    
    if (!company) {
      throw new AppError('Company not found or unauthorized', 404, 'NOT_FOUND');
    }
    
    // Delete old logo
    if (company.logo?.publicId) {
      await deleteFromCloudinary(company.logo.publicId);
    }
    
    const result = await uploadCompanyLogo(req.file, company._id);
    
    company.logo = {
      url: result.url,
      publicId: result.publicId,
    };
    await company.save();
    
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logo: result.url },
    });
  } catch (error) {
    next(error);
  }
};

// Upload company cover image
exports.uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload an image', 400, 'NO_FILE');
    }
    
    const company = await Company.findOne({
      _id: req.user.employer?.companyId,
      'admins.user': req.user._id,
    });
    
    if (!company) {
      throw new AppError('Company not found or unauthorized', 404, 'NOT_FOUND');
    }
    
    // Delete old cover
    if (company.coverImage?.publicId) {
      await deleteFromCloudinary(company.coverImage.publicId);
    }
    
    const result = await uploadCompanyCover(req.file, company._id);
    
    company.coverImage = {
      url: result.url,
      publicId: result.publicId,
    };
    await company.save();
    
    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: { coverImage: result.url },
    });
  } catch (error) {
    next(error);
  }
};

// Get filter options for companies
exports.getCompanyFilterOptions = async (req, res, next) => {
  try {
    const [industries, locations, sizes] = await Promise.all([
      Company.distinct('industry', { isActive: true }),
      Company.distinct('headquarters.city', { isActive: true }),
      Company.distinct('companySize', { isActive: true }),
    ]);
    
    res.json({
      success: true,
      data: {
        industries: industries.filter(Boolean).sort(),
        locations: locations.filter(Boolean).sort(),
        sizes: sizes.filter(Boolean),
      },
    });
  } catch (error) {
    next(error);
  }
};
