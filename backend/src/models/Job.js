const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Job Details
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },
    responsibilities: [String],
    requirements: [String],
    niceToHave: [String],
    
    // Job Type & Mode
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship', 'freelance'],
      required: true,
      index: true,
    },
    workMode: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      required: true,
      index: true,
    },
    
    // Location
    location: {
      city: { type: String, index: true },
      state: String,
      country: { type: String, default: 'India' },
      address: String,
      isRemote: Boolean,
    },
    multipleLocations: [{
      city: String,
      state: String,
      country: String,
    }],
    
    // Experience
    experience: {
      min: { type: Number, default: 0, index: true },
      max: Number,
    },
    
    // Salary
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly',
      },
      isNegotiable: Boolean,
      showSalary: { type: Boolean, default: true },
    },
    
    // Skills
    skills: [{
      name: { type: String, required: true },
      isRequired: { type: Boolean, default: true },
      experience: Number, // years
    }],
    
    // Education
    education: {
      minQualification: {
        type: String,
        enum: ['10th', '12th', 'diploma', 'graduate', 'post_graduate', 'phd', 'any'],
        default: 'any',
      },
      preferredDegrees: [String],
      preferredFields: [String],
    },
    
    // Industry & Department
    industry: {
      type: String,
      index: true,
    },
    department: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    
    // Openings
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    
    // Application Settings
    applicationSettings: {
      allowWalkIn: Boolean,
      walkInDetails: {
        date: Date,
        time: String,
        venue: String,
        contactPerson: String,
        contactNumber: String,
      },
      externalApplyUrl: String,
      isEasyApply: { type: Boolean, default: true },
      questionnaire: [{
        question: String,
        type: {
          type: String,
          enum: ['text', 'single_choice', 'multiple_choice', 'yes_no'],
        },
        options: [String],
        isRequired: Boolean,
      }],
      resumeRequired: { type: Boolean, default: true },
      coverLetterRequired: Boolean,
    },
    
    // Dates
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    startDate: Date,
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed', 'expired', 'filled'],
      default: 'active',
      index: true,
    },
    
    // Stats
    stats: {
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      shortlisted: { type: Number, default: 0 },
      hired: { type: Number, default: 0 },
    },
    
    // Featured/Promoted
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    
    // Tags for better searchability
    tags: [String],
    
    // SEO
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering
jobSchema.index({ title: 'text', description: 'text', 'skills.name': 'text' });
jobSchema.index({ status: 1, postedAt: -1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ company: 1, status: 1 });

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
});

// Pre-save to generate slug
jobSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.slug = `${this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${randomStr}`;
  }
  next();
});

// Static method to get filter options
jobSchema.statics.getFilterOptions = async function () {
  const [
    employmentTypes,
    workModes,
    locations,
    industries,
    departments,
    experienceRanges,
    salaryRanges,
  ] = await Promise.all([
    this.distinct('employmentType', { status: 'active' }),
    this.distinct('workMode', { status: 'active' }),
    this.distinct('location.city', { status: 'active' }),
    this.distinct('industry', { status: 'active' }),
    this.distinct('department', { status: 'active' }),
    this.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minExp: { $min: '$experience.min' },
          maxExp: { $max: '$experience.max' },
        },
      },
    ]),
    this.aggregate([
      { $match: { status: 'active', 'salary.showSalary': true } },
      {
        $group: {
          _id: null,
          minSalary: { $min: '$salary.min' },
          maxSalary: { $max: '$salary.max' },
        },
      },
    ]),
  ]);

  return {
    employmentTypes: employmentTypes.map(type => ({
      value: type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    })),
    workModes: workModes.map(mode => ({
      value: mode,
      label: mode.charAt(0).toUpperCase() + mode.slice(1),
    })),
    locations: locations.filter(Boolean).sort(),
    industries: industries.filter(Boolean).sort(),
    departments: departments.filter(Boolean).sort(),
    experienceRange: experienceRanges[0] || { minExp: 0, maxExp: 30 },
    salaryRange: salaryRanges[0] || { minSalary: 0, maxSalary: 10000000 },
  };
};

// Method to increment view count
jobSchema.methods.incrementViews = async function () {
  this.stats.views += 1;
  await this.save();
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
