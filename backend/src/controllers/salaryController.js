const Salary = require('../models/Salary');
const Company = require('../models/Company');
const { AppError } = require('../middleware/errorHandler');
const { paginationResponse } = require('../utils/helpers');

// Get salary insights
exports.getSalaryInsights = async (req, res, next) => {
  try {
    const { jobTitle, location, experience, company } = req.query;
    
    const match = { status: 'approved' };
    
    if (jobTitle) {
      match.jobTitle = { $regex: jobTitle, $options: 'i' };
    }
    
    if (location) {
      match['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (experience) {
      match.totalExperience = { $lte: parseInt(experience) + 2, $gte: parseInt(experience) - 2 };
    }
    
    if (company) {
      const companyDoc = await Company.findOne({
        $or: [
          { _id: company },
          { slug: company },
          { name: { $regex: company, $options: 'i' } },
        ],
      });
      if (companyDoc) {
        match.company = companyDoc._id;
      }
    }
    
    const salaryStats = await Salary.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$baseSalary.amount' },
          minSalary: { $min: '$baseSalary.amount' },
          maxSalary: { $max: '$baseSalary.amount' },
          medianSalary: { $avg: '$baseSalary.amount' },
          avgTotalComp: { $avg: '$totalCompensation' },
          count: { $sum: 1 },
          avgExperience: { $avg: '$totalExperience' },
        },
      },
    ]);
    
    // Get salary distribution by experience
    const byExperience = await Salary.aggregate([
      { $match: match },
      {
        $bucket: {
          groupBy: '$totalExperience',
          boundaries: [0, 2, 5, 8, 12, 20],
          default: '20+',
          output: {
            avgSalary: { $avg: '$baseSalary.amount' },
            count: { $sum: 1 },
          },
        },
      },
    ]);
    
    // Get top paying companies for this role
    const topCompanies = await Salary.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$company',
          avgSalary: { $avg: '$baseSalary.amount' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 2 } } },
      { $sort: { avgSalary: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          companyName: '$company.name',
          companyLogo: '$company.logo.url',
          avgSalary: 1,
          count: 1,
        },
      },
    ]);
    
    res.json({
      success: true,
      data: {
        overview: salaryStats[0] || {
          avgSalary: 0,
          minSalary: 0,
          maxSalary: 0,
          count: 0,
        },
        byExperience,
        topCompanies,
        filters: { jobTitle, location, experience, company },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search salaries
exports.searchSalaries = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      jobTitle,
      company,
      location,
      minSalary,
      maxSalary,
      sortBy = 'newest',
    } = req.query;
    
    const query = { status: 'approved' };
    
    if (jobTitle) {
      query.jobTitle = { $regex: jobTitle, $options: 'i' };
    }
    
    if (company) {
      const companyDoc = await Company.findOne({
        name: { $regex: company, $options: 'i' },
      });
      if (companyDoc) {
        query.company = companyDoc._id;
      }
    }
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (minSalary) {
      query['baseSalary.amount'] = { $gte: parseInt(minSalary) };
    }
    
    if (maxSalary) {
      query['baseSalary.amount'] = {
        ...query['baseSalary.amount'],
        $lte: parseInt(maxSalary),
      };
    }
    
    const sortOptions = {
      newest: { createdAt: -1 },
      highest: { 'baseSalary.amount': -1 },
      lowest: { 'baseSalary.amount': 1 },
    };
    
    const [salaries, total] = await Promise.all([
      Salary.find(query)
        .populate('company', 'name logo')
        .select('-user')
        .sort(sortOptions[sortBy] || sortOptions.newest)
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Salary.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(salaries, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get popular job titles for salary search
exports.getPopularTitles = async (req, res, next) => {
  try {
    const titles = await Salary.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$jobTitle',
          count: { $sum: 1 },
          avgSalary: { $avg: '$baseSalary.amount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    
    res.json({
      success: true,
      data: titles,
    });
  } catch (error) {
    next(error);
  }
};

// Get salary comparison
exports.compareSalaries = async (req, res, next) => {
  try {
    const { titles, locations } = req.body;
    
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      throw new AppError('Please provide job titles to compare', 400, 'INVALID_INPUT');
    }
    
    const comparison = await Promise.all(
      titles.map(async (title) => {
        const query = {
          status: 'approved',
          jobTitle: { $regex: title, $options: 'i' },
        };
        
        if (locations && locations.length > 0) {
          query['location.city'] = { $in: locations.map(l => new RegExp(l, 'i')) };
        }
        
        const stats = await Salary.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              avgSalary: { $avg: '$baseSalary.amount' },
              minSalary: { $min: '$baseSalary.amount' },
              maxSalary: { $max: '$baseSalary.amount' },
              count: { $sum: 1 },
            },
          },
        ]);
        
        return {
          title,
          stats: stats[0] || { avgSalary: 0, minSalary: 0, maxSalary: 0, count: 0 },
        };
      })
    );
    
    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

// Submit salary (authenticated)
exports.submitSalary = async (req, res, next) => {
  try {
    const { companyName, ...salaryData } = req.body;
    
    // Find or suggest company
    let company = await Company.findOne({
      name: { $regex: new RegExp(`^${companyName}$`, 'i') },
    });
    
    if (!company) {
      throw new AppError('Company not found. Please select a valid company.', 400, 'COMPANY_NOT_FOUND');
    }
    
    const salary = new Salary({
      ...salaryData,
      company: company._id,
      user: req.user._id,
    });
    
    await salary.save();
    
    res.status(201).json({
      success: true,
      message: 'Salary submitted for review',
      data: salary,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's submitted salaries
exports.getMySalaries = async (req, res, next) => {
  try {
    const salaries = await Salary.find({ user: req.user._id })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: salaries,
    });
  } catch (error) {
    next(error);
  }
};

// Get salary filter options
exports.getFilterOptions = async (req, res, next) => {
  try {
    const [jobTitles, locations, companies] = await Promise.all([
      Salary.distinct('jobTitle', { status: 'approved' }),
      Salary.distinct('location.city', { status: 'approved' }),
      Salary.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$company' } },
        {
          $lookup: {
            from: 'companies',
            localField: '_id',
            foreignField: '_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        { $project: { name: '$company.name', _id: '$company._id' } },
        { $sort: { name: 1 } },
      ]),
    ]);
    
    res.json({
      success: true,
      data: {
        jobTitles: jobTitles.filter(Boolean).sort(),
        locations: locations.filter(Boolean).sort(),
        companies,
      },
    });
  } catch (error) {
    next(error);
  }
};
