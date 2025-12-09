const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    
    // Employment Details
    jobTitle: {
      type: String,
      required: true,
    },
    department: String,
    employmentStatus: {
      type: String,
      enum: ['current', 'former'],
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship'],
    },
    yearsAtCompany: Number,
    location: String,
    
    // Ratings
    ratings: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      workLifeBalance: { type: Number, min: 1, max: 5 },
      salaryBenefits: { type: Number, min: 1, max: 5 },
      jobSecurity: { type: Number, min: 1, max: 5 },
      careerGrowth: { type: Number, min: 1, max: 5 },
      culture: { type: Number, min: 1, max: 5 },
      management: { type: Number, min: 1, max: 5 },
    },
    
    // Review Content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    pros: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    cons: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    advice: {
      type: String,
      maxlength: 2000,
    },
    
    // Recommendations
    recommendToFriend: Boolean,
    ceoApproval: Boolean,
    businessOutlook: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
    
    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    moderationNotes: String,
    
    // Engagement
    helpful: { type: Number, default: 0 },
    helpfulBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Flags
    flags: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      flaggedAt: { type: Date, default: Date.now },
    }],
    
    // Anonymous
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    
    // Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ company: 1, status: 1, createdAt: -1 });
reviewSchema.index({ 'ratings.overall': -1 });

// Prevent duplicate reviews from same user for same company
reviewSchema.index({ user: 1, company: 1 }, { unique: true });

// Post-save to update company ratings
reviewSchema.post('save', async function () {
  if (this.status === 'approved') {
    const Company = mongoose.model('Company');
    const company = await Company.findById(this.company);
    if (company) {
      await company.updateRatings();
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
