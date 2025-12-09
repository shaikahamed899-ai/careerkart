const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      url: String,
      publicId: String,
    },
    coverImage: {
      url: String,
      publicId: String,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },
    industry: {
      type: String,
      required: true,
      index: true,
    },
    companyType: {
      type: String,
      enum: ['startup', 'mnc', 'corporate', 'government', 'ngo', 'other'],
      default: 'corporate',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'],
    },
    foundedYear: Number,
    website: String,
    
    // Headquarters
    headquarters: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    
    // Other locations
    locations: [{
      city: String,
      state: String,
      country: String,
      address: String,
      isHeadquarters: Boolean,
    }],
    
    // Contact
    contact: {
      email: String,
      phone: String,
      hrEmail: String,
    },
    
    // Social Links
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
      youtube: String,
    },
    
    // Company Culture & Benefits
    culture: {
      values: [String],
      perks: [String],
      workLifeBalance: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    
    benefits: [{
      category: {
        type: String,
        enum: ['health', 'financial', 'lifestyle', 'professional', 'other'],
      },
      name: String,
      description: String,
    }],
    
    // Tech Stack (for tech companies)
    techStack: [String],
    
    // Ratings & Reviews Summary
    ratings: {
      overall: { type: Number, default: 0, min: 0, max: 5 },
      workLifeBalance: { type: Number, default: 0, min: 0, max: 5 },
      salaryBenefits: { type: Number, default: 0, min: 0, max: 5 },
      jobSecurity: { type: Number, default: 0, min: 0, max: 5 },
      careerGrowth: { type: Number, default: 0, min: 0, max: 5 },
      culture: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    
    // Salary Statistics
    salaryStats: {
      averageSalary: Number,
      minSalary: Number,
      maxSalary: Number,
      totalSalaryReports: { type: Number, default: 0 },
    },
    
    // Interview Statistics
    interviewStats: {
      totalInterviews: { type: Number, default: 0 },
      averageDifficulty: { type: Number, default: 0, min: 1, max: 5 },
      positiveExperience: { type: Number, default: 0 },
      negativeExperience: { type: Number, default: 0 },
      neutralExperience: { type: Number, default: 0 },
    },
    
    // Employers/Admins
    admins: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['owner', 'admin', 'recruiter'],
        default: 'recruiter',
      },
      addedAt: { type: Date, default: Date.now },
    }],
    
    // Followers
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    followersCount: {
      type: Number,
      default: 0,
    },
    
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [{
      type: String,
      url: String,
      uploadedAt: Date,
    }],
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // SEO
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1, 'headquarters.city': 1 });
companySchema.index({ 'ratings.overall': -1 });
companySchema.index({ followersCount: -1 });

// Virtual for active jobs count
companySchema.virtual('activeJobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  match: { status: 'active' },
});

// Pre-save to generate slug
companySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to update ratings
companySchema.methods.updateRatings = async function () {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ company: this._id, status: 'approved' });
  
  if (reviews.length === 0) return;
  
  const totals = reviews.reduce(
    (acc, review) => {
      acc.overall += review.ratings.overall || 0;
      acc.workLifeBalance += review.ratings.workLifeBalance || 0;
      acc.salaryBenefits += review.ratings.salaryBenefits || 0;
      acc.jobSecurity += review.ratings.jobSecurity || 0;
      acc.careerGrowth += review.ratings.careerGrowth || 0;
      acc.culture += review.ratings.culture || 0;
      return acc;
    },
    { overall: 0, workLifeBalance: 0, salaryBenefits: 0, jobSecurity: 0, careerGrowth: 0, culture: 0 }
  );
  
  const count = reviews.length;
  this.ratings = {
    overall: (totals.overall / count).toFixed(1),
    workLifeBalance: (totals.workLifeBalance / count).toFixed(1),
    salaryBenefits: (totals.salaryBenefits / count).toFixed(1),
    jobSecurity: (totals.jobSecurity / count).toFixed(1),
    careerGrowth: (totals.careerGrowth / count).toFixed(1),
    culture: (totals.culture / count).toFixed(1),
    totalReviews: count,
  };
  
  await this.save();
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
