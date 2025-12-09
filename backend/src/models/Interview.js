const mongoose = require('mongoose');

// Interview Experience Schema (user submitted)
const interviewExperienceSchema = new mongoose.Schema(
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
    jobTitle: {
      type: String,
      required: true,
      index: true,
    },
    
    // Interview Details
    applicationSource: {
      type: String,
      enum: ['job_portal', 'referral', 'campus', 'company_website', 'recruiter', 'other'],
    },
    interviewDate: Date,
    location: {
      type: String,
      enum: ['onsite', 'remote', 'phone'],
    },
    
    // Experience
    experience: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      required: true,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    
    // Outcome
    gotOffer: Boolean,
    acceptedOffer: Boolean,
    
    // Interview Rounds
    rounds: [{
      roundNumber: Number,
      type: {
        type: String,
        enum: ['hr', 'technical', 'managerial', 'group_discussion', 'aptitude', 'coding', 'system_design', 'behavioral'],
      },
      duration: Number, // minutes
      description: String,
      questions: [{
        question: String,
        answer: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
        },
        topic: String,
      }],
    }],
    
    // Overall Review
    review: {
      type: String,
      maxlength: 5000,
    },
    tips: {
      type: String,
      maxlength: 2000,
    },
    
    // Salary Offered
    salaryOffered: {
      amount: Number,
      currency: { type: String, default: 'INR' },
    },
    
    // Tags
    tags: [String],
    
    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    moderationNotes: String,
    
    // Engagement
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Anonymous posting
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewExperienceSchema.index({ company: 1, status: 1, createdAt: -1 });
interviewExperienceSchema.index({ jobTitle: 'text', review: 'text' });

// Post-save to update company stats
interviewExperienceSchema.post('save', async function () {
  if (this.status === 'approved') {
    const Company = mongoose.model('Company');
    const stats = await this.constructor.aggregate([
      { $match: { company: this.company, status: 'approved' } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgDifficulty: { $avg: '$difficulty' },
          positive: {
            $sum: { $cond: [{ $eq: ['$experience', 'positive'] }, 1, 0] },
          },
          negative: {
            $sum: { $cond: [{ $eq: ['$experience', 'negative'] }, 1, 0] },
          },
          neutral: {
            $sum: { $cond: [{ $eq: ['$experience', 'neutral'] }, 1, 0] },
          },
        },
      },
    ]);
    
    if (stats.length > 0) {
      await Company.findByIdAndUpdate(this.company, {
        interviewStats: {
          totalInterviews: stats[0].totalInterviews,
          averageDifficulty: stats[0].avgDifficulty.toFixed(1),
          positiveExperience: stats[0].positive,
          negativeExperience: stats[0].negative,
          neutralExperience: stats[0].neutral,
        },
      });
    }
  }
});

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);

// Interview Bot Session Schema
const interviewBotSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Session Type
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'hr', 'mixed'],
      required: true,
    },
    
    // Configuration
    config: {
      jobRole: String,
      company: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
      skills: [String],
      duration: Number, // minutes
      questionCount: { type: Number, default: 10 },
    },
    
    // Questions and Answers
    conversation: [{
      role: {
        type: String,
        enum: ['system', 'assistant', 'user'],
      },
      content: String,
      timestamp: { type: Date, default: Date.now },
      questionNumber: Number,
      feedback: {
        score: { type: Number, min: 0, max: 10 },
        strengths: [String],
        improvements: [String],
        suggestion: String,
      },
    }],
    
    // Session Status
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    
    // Results
    results: {
      overallScore: { type: Number, min: 0, max: 100 },
      categoryScores: {
        technicalKnowledge: Number,
        communication: Number,
        problemSolving: Number,
        confidence: Number,
      },
      strengths: [String],
      areasToImprove: [String],
      recommendations: [String],
      summary: String,
    },
    
    // Timestamps
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewBotSessionSchema.index({ user: 1, createdAt: -1 });
interviewBotSessionSchema.index({ user: 1, status: 1 });

const InterviewBotSession = mongoose.model('InterviewBotSession', interviewBotSessionSchema);

module.exports = {
  InterviewExperience,
  InterviewBotSession,
};
