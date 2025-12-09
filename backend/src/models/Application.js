const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    
    // Application Details
    resume: {
      url: String,
      publicId: String,
      fileName: String,
    },
    coverLetter: {
      type: String,
      maxlength: 5000,
    },
    
    // Questionnaire Answers
    questionnaireAnswers: [{
      question: String,
      answer: mongoose.Schema.Types.Mixed,
    }],
    
    // Status
    status: {
      type: String,
      enum: [
        'applied',
        'viewed',
        'shortlisted',
        'interview_scheduled',
        'interviewed',
        'offered',
        'hired',
        'rejected',
        'withdrawn',
      ],
      default: 'applied',
      index: true,
    },
    
    // Status History
    statusHistory: [{
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      changedAt: { type: Date, default: Date.now },
      notes: String,
    }],
    
    // Employer Notes (internal)
    employerNotes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      addedAt: { type: Date, default: Date.now },
    }],
    
    // Rating by employer
    employerRating: {
      score: { type: Number, min: 1, max: 5 },
      feedback: String,
    },
    
    // Interview Details
    interviews: [{
      type: {
        type: String,
        enum: ['phone', 'video', 'onsite', 'technical', 'hr'],
      },
      scheduledAt: Date,
      duration: Number, // minutes
      location: String,
      meetingLink: String,
      interviewers: [{
        name: String,
        email: String,
        designation: String,
      }],
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
        default: 'scheduled',
      },
      feedback: {
        rating: Number,
        comments: String,
        recommendation: {
          type: String,
          enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire'],
        },
      },
    }],
    
    // Offer Details
    offer: {
      salary: Number,
      currency: { type: String, default: 'INR' },
      joiningDate: Date,
      offerLetterUrl: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'negotiating'],
      },
      expiresAt: Date,
    },
    
    // Match Score (AI calculated)
    matchScore: {
      overall: { type: Number, min: 0, max: 100 },
      skills: { type: Number, min: 0, max: 100 },
      experience: { type: Number, min: 0, max: 100 },
      education: { type: Number, min: 0, max: 100 },
    },
    
    // Source
    source: {
      type: String,
      enum: ['direct', 'referral', 'job_board', 'social', 'other'],
      default: 'direct',
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Timestamps
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    viewedAt: Date,
    shortlistedAt: Date,
    rejectedAt: Date,
    withdrawnAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ status: 1, appliedAt: -1 });
applicationSchema.index({ company: 1, status: 1 });

// Pre-save to add status history
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
    
    // Update timestamp based on status
    switch (this.status) {
      case 'viewed':
        this.viewedAt = new Date();
        break;
      case 'shortlisted':
        this.shortlistedAt = new Date();
        break;
      case 'rejected':
        this.rejectedAt = new Date();
        break;
      case 'withdrawn':
        this.withdrawnAt = new Date();
        break;
    }
  }
  next();
});

// Post-save to update job stats
applicationSchema.post('save', async function () {
  const Job = mongoose.model('Job');
  const stats = await this.constructor.aggregate([
    { $match: { job: this.job } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const statsObj = stats.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});
  
  await Job.findByIdAndUpdate(this.job, {
    'stats.applications': Object.values(statsObj).reduce((a, b) => a + b, 0),
    'stats.shortlisted': statsObj.shortlisted || 0,
    'stats.hired': statsObj.hired || 0,
  });
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
