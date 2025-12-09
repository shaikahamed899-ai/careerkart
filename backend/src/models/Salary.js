const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
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
    
    // Job Details
    jobTitle: {
      type: String,
      required: true,
      index: true,
    },
    department: String,
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    
    // Experience
    yearsAtCompany: Number,
    totalExperience: Number,
    
    // Salary Details
    baseSalary: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      period: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'yearly',
      },
    },
    
    // Additional Compensation
    bonus: {
      amount: Number,
      type: {
        type: String,
        enum: ['performance', 'signing', 'retention', 'other'],
      },
      frequency: {
        type: String,
        enum: ['one_time', 'quarterly', 'yearly'],
      },
    },
    
    stockOptions: {
      hasStock: Boolean,
      vestingPeriod: Number, // years
      estimatedValue: Number,
    },
    
    otherBenefits: [{
      name: String,
      value: Number,
      description: String,
    }],
    
    // Total Compensation
    totalCompensation: {
      type: Number,
      required: true,
    },
    
    // Employment Type
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship'],
      default: 'full_time',
    },
    
    // Additional Info
    education: {
      type: String,
      enum: ['high_school', 'bachelors', 'masters', 'phd', 'other'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    
    // Satisfaction
    satisfaction: {
      type: Number,
      min: 1,
      max: 5,
    },
    
    // Review
    review: {
      type: String,
      maxlength: 2000,
    },
    
    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    
    // Anonymous
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ['offer_letter', 'pay_slip', 'linkedin', 'none'],
    },
    
    // Report date (when salary was received)
    salaryDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
salarySchema.index({ company: 1, jobTitle: 1, status: 1 });
salarySchema.index({ 'location.city': 1, jobTitle: 1 });
salarySchema.index({ totalCompensation: 1 });

// Post-save to update company salary stats
salarySchema.post('save', async function () {
  if (this.status === 'approved') {
    const Company = mongoose.model('Company');
    const stats = await this.constructor.aggregate([
      { $match: { company: this.company, status: 'approved' } },
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
    
    if (stats.length > 0) {
      await Company.findByIdAndUpdate(this.company, {
        salaryStats: {
          averageSalary: Math.round(stats[0].avgSalary),
          minSalary: stats[0].minSalary,
          maxSalary: stats[0].maxSalary,
          totalSalaryReports: stats[0].count,
        },
      });
    }
  }
});

// Static method to get salary statistics
salarySchema.statics.getSalaryStats = async function (filters = {}) {
  const match = { status: 'approved', ...filters };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          jobTitle: '$jobTitle',
          city: '$location.city',
        },
        avgSalary: { $avg: '$baseSalary.amount' },
        minSalary: { $min: '$baseSalary.amount' },
        maxSalary: { $max: '$baseSalary.amount' },
        medianSalary: { $avg: '$baseSalary.amount' }, // Simplified
        count: { $sum: 1 },
        avgExperience: { $avg: '$totalExperience' },
      },
    },
    { $sort: { avgSalary: -1 } },
  ]);
};

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;
