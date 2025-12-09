const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { paginationResponse } = require('../utils/helpers');

// Get employer's company
exports.getMyCompany = async (req, res, next) => {
  try {
    const companyId = req.user.employer?.companyId;
    
    if (!companyId) {
      return res.json({
        success: true,
        data: null,
        message: 'No company set up yet',
      });
    }
    
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.json({
        success: true,
        data: null,
        message: 'Company not found',
      });
    }
    
    // Get additional stats
    const [activeJobsCount, totalApplications] = await Promise.all([
      Job.countDocuments({ company: companyId, status: 'active' }),
      Application.countDocuments({ company: companyId }),
    ]);
    
    res.json({
      success: true,
      data: {
        ...company.toObject(),
        activeJobsCount,
        totalApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard overview
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.employer?.companyId;
    
    // Basic stats
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      newApplications,
      shortlistedCount,
      interviewsScheduled,
      hiredCount,
    ] = await Promise.all([
      Job.countDocuments({ postedBy: userId }),
      Job.countDocuments({ postedBy: userId, status: 'active' }),
      Application.countDocuments({ company: companyId }),
      Application.countDocuments({
        company: companyId,
        status: 'applied',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Application.countDocuments({ company: companyId, status: 'shortlisted' }),
      Application.countDocuments({ company: companyId, status: 'interview_scheduled' }),
      Application.countDocuments({ company: companyId, status: 'hired' }),
    ]);
    
    // Recent applications
    const recentApplications = await Application.find({ company: companyId })
      .populate('applicant', 'name email avatar profile.headline')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Recent jobs
    const recentJobs = await Job.find({ postedBy: userId })
      .select('title status stats createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Application status breakdown
    const applicationsByStatus = await Application.aggregate([
      { $match: { company: companyId ? require('mongoose').Types.ObjectId(companyId) : null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          newApplications,
          shortlistedCount,
          interviewsScheduled,
          hiredCount,
        },
        recentApplications,
        recentJobs,
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get detailed analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.employer?.companyId;
    const { period = '30' } = req.query; // days
    
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    
    // Applications over time
    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          company: companyId ? require('mongoose').Types.ObjectId(companyId) : null,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    // Job views over time
    const jobViewsOverTime = await Job.aggregate([
      { $match: { postedBy: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$stats.views' },
          totalApplications: { $sum: '$stats.applications' },
        },
      },
    ]);
    
    // Top performing jobs
    const topJobs = await Job.find({ postedBy: userId })
      .select('title stats status createdAt')
      .sort({ 'stats.applications': -1 })
      .limit(5);
    
    // Conversion rates
    const conversionData = await Application.aggregate([
      { $match: { company: companyId ? require('mongoose').Types.ObjectId(companyId) : null } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          viewed: {
            $sum: { $cond: [{ $ne: ['$viewedAt', null] }, 1, 0] },
          },
          shortlisted: {
            $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] },
          },
          interviewed: {
            $sum: {
              $cond: [
                { $in: ['$status', ['interview_scheduled', 'interviewed', 'offered', 'hired']] },
                1,
                0,
              ],
            },
          },
          hired: {
            $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] },
          },
        },
      },
    ]);
    
    // Source breakdown
    const sourceBreakdown = await Application.aggregate([
      { $match: { company: companyId ? require('mongoose').Types.ObjectId(companyId) : null } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);
    
    res.json({
      success: true,
      data: {
        applicationsOverTime,
        jobStats: jobViewsOverTime[0] || { totalViews: 0, totalApplications: 0 },
        topJobs,
        conversionFunnel: conversionData[0] || {
          total: 0,
          viewed: 0,
          shortlisted: 0,
          interviewed: 0,
          hired: 0,
        },
        sourceBreakdown: sourceBreakdown.reduce((acc, item) => {
          acc[item._id || 'direct'] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get application analytics
exports.getApplicationAnalytics = async (req, res, next) => {
  try {
    const companyId = req.user.employer?.companyId;
    const { period = '30' } = req.query;
    
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    
    // Daily applications
    const dailyApplications = await Application.aggregate([
      {
        $match: {
          company: companyId ? require('mongoose').Types.ObjectId(companyId) : null,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    // Status distribution
    const statusDistribution = await Application.aggregate([
      { $match: { company: companyId ? require('mongoose').Types.ObjectId(companyId) : null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    // Average time to hire
    const hiredApplications = await Application.find({
      company: companyId,
      status: 'hired',
    }).select('createdAt updatedAt');
    
    let avgTimeToHire = 0;
    if (hiredApplications.length > 0) {
      const totalDays = hiredApplications.reduce((sum, app) => {
        const days = Math.ceil(
          (new Date(app.updatedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgTimeToHire = Math.round(totalDays / hiredApplications.length);
    }
    
    res.json({
      success: true,
      data: {
        dailyApplications,
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgTimeToHire,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get job analytics
exports.getJobAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Jobs by status
    const jobsByStatus = await Job.aggregate([
      { $match: { postedBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    // Jobs by employment type
    const jobsByType = await Job.aggregate([
      { $match: { postedBy: userId } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
    ]);
    
    // Jobs performance
    const jobsPerformance = await Job.find({ postedBy: userId })
      .select('title stats status createdAt employmentType workMode')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        jobsByStatus: jobsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        jobsByType: jobsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        jobsPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications across all jobs
exports.getAllApplications = async (req, res, next) => {
  try {
    const companyId = req.user.employer?.companyId;
    const { page = 1, limit = 20, status, sortBy = 'newest' } = req.query;
    
    const query = { company: companyId };
    if (status) {
      query.status = status;
    }
    
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      match_score: { 'matchScore.overall': -1 },
    };
    
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email avatar phone profile.headline profile.totalExperience profile.skills resume')
        .populate('job', 'title location employmentType')
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
