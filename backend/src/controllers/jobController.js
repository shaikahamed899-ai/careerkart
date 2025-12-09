const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');
const { paginationResponse, buildJobFilterQuery, buildSortQuery, calculateMatchScore } = require('../utils/helpers');
const { sendApplicationReceivedEmail } = require('../utils/email');

// Get all jobs with filters
exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest',
      ...filters
    } = req.query;
    
    const query = buildJobFilterQuery(filters);
    const sort = buildSortQuery(sortBy);
    
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('company', 'name logo ratings.overall headquarters.city')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query),
    ]);
    
    // Calculate match score if user is authenticated
    let jobsWithScore = jobs;
    if (req.user) {
      jobsWithScore = jobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, req.user),
      }));
    }
    
    res.json({
      success: true,
      ...paginationResponse(jobsWithScore, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get job filter options
exports.getFilterOptions = async (req, res, next) => {
  try {
    const filterOptions = await Job.getFilterOptions();
    
    res.json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    next(error);
  }
};

// Get single job
exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id)
      .populate('company', 'name logo description industry companySize headquarters ratings socialLinks')
      .populate('postedBy', 'name avatar');
    
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }
    
    // Increment view count
    await job.incrementViews();
    
    // Check if user has applied
    let hasApplied = false;
    let isSaved = false;
    let matchScore = null;
    
    if (req.user) {
      const application = await Application.findOne({
        job: id,
        applicant: req.user._id,
      });
      hasApplied = !!application;
      isSaved = req.user.savedJobs?.includes(id);
      matchScore = calculateMatchScore(job, req.user);
    }
    
    res.json({
      success: true,
      data: {
        ...job.toObject(),
        hasApplied,
        isSaved,
        matchScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get similar jobs
exports.getSimilarJobs = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }
    
    const similarJobs = await Job.find({
      _id: { $ne: id },
      status: 'active',
      $or: [
        { 'skills.name': { $in: job.skills.map(s => s.name) } },
        { industry: job.industry },
        { 'location.city': job.location.city },
      ],
    })
      .populate('company', 'name logo')
      .limit(6)
      .lean();
    
    res.json({
      success: true,
      data: similarJobs,
    });
  } catch (error) {
    next(error);
  }
};

// Apply for job
exports.applyForJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { coverLetter, questionnaireAnswers } = req.body;
    
    const job = await Job.findById(id).populate('company', 'name');
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }
    
    if (job.status !== 'active') {
      throw new AppError('This job is no longer accepting applications', 400, 'JOB_CLOSED');
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      job: id,
      applicant: req.user._id,
    });
    
    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400, 'ALREADY_APPLIED');
    }
    
    // Check if resume is required
    if (job.applicationSettings?.resumeRequired && !req.user.resume?.url) {
      throw new AppError('Please upload your resume before applying', 400, 'RESUME_REQUIRED');
    }
    
    // Create application
    const application = new Application({
      job: id,
      applicant: req.user._id,
      company: job.company._id,
      resume: req.user.resume,
      coverLetter,
      questionnaireAnswers,
      matchScore: {
        overall: calculateMatchScore(job, req.user),
      },
    });
    
    await application.save();
    
    // Send email notification
    try {
      await sendApplicationReceivedEmail(
        req.user.email,
        req.user.name,
        job.title,
        job.company.name
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    // Create notification for employer
    await Notification.createNotification({
      recipient: job.postedBy,
      type: 'new_application',
      title: 'New Application Received',
      message: `${req.user.name} applied for ${job.title}`,
      relatedJob: job._id,
      relatedApplication: application._id,
      relatedUser: req.user._id,
      actionUrl: `/employer/applications/${application._id}`,
    });
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { applicant: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'job',
          select: 'title location employmentType salary status',
          populate: {
            path: 'company',
            select: 'name logo',
          },
        })
        .sort({ appliedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(applications, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({
      _id: applicationId,
      applicant: req.user._id,
    });
    
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }
    
    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      throw new AppError('Cannot withdraw this application', 400, 'CANNOT_WITHDRAW');
    }
    
    application.status = 'withdrawn';
    await application.save();
    
    res.json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Search jobs
exports.searchJobs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_QUERY');
    }
    
    const query = {
      status: 'active',
      $text: { $search: q },
    };
    
    const [jobs, total] = await Promise.all([
      Job.find(query, { score: { $meta: 'textScore' } })
        .populate('company', 'name logo')
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(jobs, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get recommended jobs for user
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const user = req.user;
    const { limit = 10 } = req.query;
    
    // Build query based on user preferences and skills
    const query = {
      status: 'active',
    };
    
    if (user.profile?.skills?.length > 0) {
      query['skills.name'] = {
        $in: user.profile.skills.map(s => new RegExp(s.name, 'i')),
      };
    }
    
    if (user.preferences?.preferredLocations?.length > 0) {
      query.$or = [
        { 'location.city': { $in: user.preferences.preferredLocations } },
        { workMode: 'remote' },
      ];
    }
    
    if (user.profile?.totalExperience) {
      const exp = user.profile.totalExperience.years;
      query['experience.min'] = { $lte: exp + 2 };
    }
    
    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .limit(parseInt(limit))
      .lean();
    
    // Calculate and sort by match score
    const jobsWithScore = jobs
      .map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, user),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
      success: true,
      data: jobsWithScore,
    });
  } catch (error) {
    next(error);
  }
};

// ============ EMPLOYER ROUTES ============

// Create job (Employer)
exports.createJob = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user.employer?.companyId) {
      throw new AppError('Please set up your company first', 400, 'COMPANY_NOT_SET');
    }
    
    const jobData = {
      ...req.body,
      company: user.employer.companyId,
      postedBy: user._id,
    };
    
    const job = new Job(jobData);
    await job.save();
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Update job (Employer)
exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findOne({
      _id: id,
      postedBy: req.user._id,
    });
    
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }
    
    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'responsibilities',
      'requirements', 'niceToHave', 'employmentType', 'workMode',
      'location', 'experience', 'salary', 'skills', 'education',
      'industry', 'department', 'openings', 'applicationSettings',
      'deadline', 'status', 'tags',
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });
    
    await job.save();
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Delete job (Employer)
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findOneAndDelete({
      _id: id,
      postedBy: req.user._id,
    });
    
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get employer's jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { postedBy: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('company', 'name logo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(jobs, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get applications for a job (Employer)
exports.getJobApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status, sortBy = 'newest' } = req.query;
    
    // Verify job belongs to employer
    const job = await Job.findOne({
      _id: id,
      postedBy: req.user._id,
    });
    
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }
    
    const query = { job: id };
    if (status) {
      query.status = status;
    }
    
    const sortOptions = {
      newest: { appliedAt: -1 },
      oldest: { appliedAt: 1 },
      match_score: { 'matchScore.overall': -1 },
    };
    
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email avatar phone profile.headline profile.totalExperience profile.skills resume')
        .sort(sortOptions[sortBy] || sortOptions.newest)
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(applications, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (Employer)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    
    const application = await Application.findById(applicationId)
      .populate('job', 'title postedBy')
      .populate('applicant', 'name email');
    
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }
    
    // Verify employer owns the job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }
    
    application.status = status;
    if (notes) {
      application.employerNotes.push({
        note: notes,
        addedBy: req.user._id,
      });
    }
    
    await application.save();
    
    // Create notification for applicant
    const notificationTypes = {
      viewed: { type: 'application_viewed', title: 'Application Viewed' },
      shortlisted: { type: 'application_shortlisted', title: 'You\'ve been shortlisted!' },
      rejected: { type: 'application_rejected', title: 'Application Update' },
      interview_scheduled: { type: 'interview_scheduled', title: 'Interview Scheduled' },
    };
    
    if (notificationTypes[status]) {
      await Notification.createNotification({
        recipient: application.applicant._id,
        type: notificationTypes[status].type,
        title: notificationTypes[status].title,
        message: `Your application for ${application.job.title} has been ${status.replace('_', ' ')}`,
        relatedJob: application.job._id,
        relatedApplication: application._id,
        actionUrl: `/applications/${application._id}`,
      });
    }
    
    res.json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Schedule interview (Employer)
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const interviewData = req.body;
    
    const application = await Application.findById(applicationId)
      .populate('job', 'title postedBy company')
      .populate('applicant', 'name email');
    
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }
    
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }
    
    application.interviews.push(interviewData);
    application.status = 'interview_scheduled';
    await application.save();
    
    // Send notification
    await Notification.createNotification({
      recipient: application.applicant._id,
      type: 'interview_scheduled',
      title: 'Interview Scheduled!',
      message: `Your interview for ${application.job.title} has been scheduled`,
      relatedJob: application.job._id,
      relatedApplication: application._id,
      actionUrl: `/applications/${application._id}`,
    });
    
    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
