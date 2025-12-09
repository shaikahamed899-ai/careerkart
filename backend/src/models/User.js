const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },

    // Authentication
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    linkedinId: {
      type: String,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'linkedin'],
      default: 'local',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Role
    role: {
      type: String,
      enum: ['job_seeker', 'employer', 'admin'],
      default: 'job_seeker',
    },

    // Onboarding
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    onboarding: {
      userType: {
        type: String,
        enum: ['fresher', 'experienced', 'employer'],
      },
      currentStep: {
        type: Number,
        default: 0,
      },
      completedSteps: [Number],
      answers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },

    // Profile - Job Seeker
    profile: {
      headline: {
        type: String,
        maxlength: 200,
      },
      summary: {
        type: String,
        maxlength: 2000,
      },
      location: {
        city: String,
        state: String,
        country: String,
        pincode: String,
      },
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      },
      currentSalary: {
        amount: Number,
        currency: { type: String, default: 'INR' },
      },
      expectedSalary: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' },
      },
      noticePeriod: {
        type: String,
        enum: ['immediate', '15_days', '1_month', '2_months', '3_months', 'more_than_3_months'],
      },
      totalExperience: {
        years: { type: Number, default: 0 },
        months: { type: Number, default: 0 },
      },
      skills: [{
        name: String,
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        yearsOfExperience: Number,
      }],
      languages: [{
        name: String,
        proficiency: {
          type: String,
          enum: ['basic', 'conversational', 'fluent', 'native'],
        },
      }],
      socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String,
        twitter: String,
      },
    },

    // Education
    education: [{
      institution: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean,
      grade: String,
      description: String,
    }],

    // Work Experience
    experience: [{
      company: {
        type: String,
        required: true,
      },
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
      title: {
        type: String,
        required: true,
      },
      employmentType: {
        type: String,
        enum: ['full_time', 'part_time', 'contract', 'internship', 'freelance'],
      },
      location: String,
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean,
      description: String,
      skills: [String],
    }],

    // Resume
    resume: {
      url: String,
      publicId: String,
      fileName: String,
      uploadedAt: Date,
      parsedData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },

    // Employer specific fields
    employer: {
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
      designation: String,
      department: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
    },

    // Preferences
    preferences: {
      jobAlerts: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'recruiters_only'],
        default: 'public',
      },
      preferredJobTypes: [{
        type: String,
        enum: ['full_time', 'part_time', 'contract', 'internship', 'freelance', 'remote'],
      }],
      preferredLocations: [String],
      preferredIndustries: [String],
    },

    // Stats
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Connections/Network
    connections: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      connectedAt: Date,
    }],

    // Saved Jobs
    savedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    }],

    // Following Companies
    followingCompanies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    }],

    // Activity
    lastLogin: Date,
    lastActive: Date,
    loginHistory: [{
      ip: String,
      userAgent: String,
      timestamp: Date,
    }],

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: String,

    // Refresh tokens for JWT
    refreshTokens: [{
      token: String,
      expiresAt: Date,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ 'profile.skills.name': 1 });
userSchema.index({ 'profile.location.city': 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'applicant',
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function () {
  let completion = 0;
  const weights = {
    name: 5,
    email: 5,
    phone: 5,
    avatar: 5,
    headline: 10,
    summary: 10,
    location: 5,
    skills: 15,
    education: 15,
    experience: 15,
    resume: 10,
  };

  if (this.name) completion += weights.name;
  if (this.email) completion += weights.email;
  if (this.phone) completion += weights.phone;
  if (this.avatar) completion += weights.avatar;
  if (this.profile?.headline) completion += weights.headline;
  if (this.profile?.summary) completion += weights.summary;
  if (this.profile?.location?.city) completion += weights.location;
  if (this.profile?.skills?.length > 0) completion += weights.skills;
  if (this.education?.length > 0) completion += weights.education;
  if (this.experience?.length > 0) completion += weights.experience;
  if (this.resume?.url) completion += weights.resume;

  this.profileCompletion = completion;
  return completion;
};

// Method to get public profile
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    avatar: this.avatar,
    headline: this.profile?.headline,
    location: this.profile?.location,
    skills: this.profile?.skills,
    totalExperience: this.profile?.totalExperience,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
