const { InterviewBotSession } = require('../models/Interview');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config');

// Initialize OpenAI (optional - will work without it using mock responses)
let openai = null;
try {
  if (config.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }
} catch (error) {
  console.log('OpenAI not configured, using mock responses');
}

// Interview questions database (fallback when OpenAI is not available)
const questionDatabase = {
  technical: {
    javascript: [
      'Explain the difference between var, let, and const in JavaScript.',
      'What is closure in JavaScript? Can you give an example?',
      'Explain the event loop in JavaScript.',
      'What are Promises and how do they work?',
      'Explain the difference between == and === in JavaScript.',
    ],
    react: [
      'What is the virtual DOM and how does React use it?',
      'Explain the difference between state and props.',
      'What are React hooks? Name some commonly used hooks.',
      'How does useEffect work and when would you use it?',
      'What is the purpose of keys in React lists?',
    ],
    python: [
      'What is the difference between a list and a tuple in Python?',
      'Explain decorators in Python.',
      'What is the GIL in Python?',
      'How does garbage collection work in Python?',
      'Explain the difference between deep copy and shallow copy.',
    ],
    general: [
      'What is the difference between SQL and NoSQL databases?',
      'Explain RESTful API design principles.',
      'What is the difference between authentication and authorization?',
      'Explain the concept of microservices architecture.',
      'What are design patterns? Name a few you have used.',
    ],
  },
  behavioral: [
    'Tell me about a time when you had to deal with a difficult team member.',
    'Describe a situation where you had to meet a tight deadline.',
    'Tell me about a project you are most proud of.',
    'How do you handle criticism of your work?',
    'Describe a time when you had to learn something new quickly.',
    'Tell me about a time when you failed and what you learned from it.',
    'How do you prioritize your tasks when you have multiple deadlines?',
    'Describe a situation where you had to convince others of your idea.',
  ],
  hr: [
    'Why do you want to work for our company?',
    'Where do you see yourself in 5 years?',
    'What are your salary expectations?',
    'Why are you leaving your current job?',
    'What are your strengths and weaknesses?',
    'How do you handle work-life balance?',
    'What motivates you at work?',
    'Do you have any questions for us?',
  ],
};

// Start interview session
exports.startSession = async (req, res, next) => {
  try {
    const { type, config: sessionConfig } = req.body;
    
    if (!['technical', 'behavioral', 'hr', 'mixed'].includes(type)) {
      throw new AppError('Invalid interview type', 400, 'INVALID_TYPE');
    }
    
    const session = new InterviewBotSession({
      user: req.user._id,
      type,
      config: {
        jobRole: sessionConfig?.jobRole || 'Software Developer',
        company: sessionConfig?.company,
        difficulty: sessionConfig?.difficulty || 'medium',
        skills: sessionConfig?.skills || [],
        duration: sessionConfig?.duration || 30,
        questionCount: sessionConfig?.questionCount || 10,
      },
    });
    
    // Generate initial system message
    const systemMessage = generateSystemPrompt(session.type, session.config);
    session.conversation.push({
      role: 'system',
      content: systemMessage,
    });
    
    // Generate first question
    const firstQuestion = await generateQuestion(session, 1);
    session.conversation.push({
      role: 'assistant',
      content: firstQuestion,
      questionNumber: 1,
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Interview session started',
      data: {
        sessionId: session._id,
        type: session.type,
        config: session.config,
        currentQuestion: {
          number: 1,
          content: firstQuestion,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Submit answer and get next question
exports.submitAnswer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;
    
    const session = await InterviewBotSession.findOne({
      _id: sessionId,
      user: req.user._id,
      status: 'in_progress',
    });
    
    if (!session) {
      throw new AppError('Session not found or already completed', 404, 'NOT_FOUND');
    }
    
    // Get current question number
    const currentQuestionNumber = session.conversation.filter(
      (m) => m.role === 'assistant' && m.questionNumber
    ).length;
    
    // Add user's answer
    session.conversation.push({
      role: 'user',
      content: answer,
    });
    
    // Generate feedback for the answer
    const feedback = await generateFeedback(session, answer, currentQuestionNumber);
    
    // Check if interview is complete
    const isComplete = currentQuestionNumber >= session.config.questionCount;
    
    if (isComplete) {
      // Generate final results
      session.status = 'completed';
      session.completedAt = new Date();
      session.results = await generateResults(session);
      
      await session.save();
      
      return res.json({
        success: true,
        data: {
          isComplete: true,
          feedback,
          results: session.results,
        },
      });
    }
    
    // Generate next question
    const nextQuestionNumber = currentQuestionNumber + 1;
    const nextQuestion = await generateQuestion(session, nextQuestionNumber);
    
    session.conversation.push({
      role: 'assistant',
      content: nextQuestion,
      questionNumber: nextQuestionNumber,
      feedback,
    });
    
    await session.save();
    
    res.json({
      success: true,
      data: {
        isComplete: false,
        feedback,
        nextQuestion: {
          number: nextQuestionNumber,
          content: nextQuestion,
        },
        progress: {
          current: nextQuestionNumber,
          total: session.config.questionCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get session details
exports.getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewBotSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });
    
    if (!session) {
      throw new AppError('Session not found', 404, 'NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's interview history
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const sessions = await InterviewBotSession.find({ user: req.user._id })
      .select('type config status results.overallScore createdAt completedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await InterviewBotSession.countDocuments({ user: req.user._id });
    
    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// End session early
exports.endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewBotSession.findOne({
      _id: sessionId,
      user: req.user._id,
      status: 'in_progress',
    });
    
    if (!session) {
      throw new AppError('Session not found', 404, 'NOT_FOUND');
    }
    
    session.status = 'abandoned';
    await session.save();
    
    res.json({
      success: true,
      message: 'Session ended',
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function generateSystemPrompt(type, config) {
  const prompts = {
    technical: `You are an experienced technical interviewer conducting a ${config.difficulty} level interview for a ${config.jobRole} position. Focus on ${config.skills.join(', ') || 'general programming'} skills. Ask clear, specific questions and evaluate answers based on technical accuracy, problem-solving approach, and communication.`,
    behavioral: `You are an HR professional conducting a behavioral interview for a ${config.jobRole} position. Ask questions using the STAR method (Situation, Task, Action, Result) to understand the candidate's past experiences and how they handle various workplace situations.`,
    hr: `You are a friendly HR representative conducting a general interview for a ${config.jobRole} position${config.company ? ` at ${config.company}` : ''}. Ask questions about the candidate's background, career goals, and cultural fit.`,
    mixed: `You are conducting a comprehensive interview for a ${config.jobRole} position. Mix technical questions, behavioral questions, and HR questions to get a complete picture of the candidate.`,
  };
  
  return prompts[type] || prompts.mixed;
}

async function generateQuestion(session, questionNumber) {
  // Try OpenAI first
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: session.conversation[0].content },
          ...session.conversation.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: 'user',
            content: `Generate interview question #${questionNumber}. Make it relevant to the role and previous answers if any.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI error:', error);
    }
  }
  
  // Fallback to question database
  return getQuestionFromDatabase(session.type, session.config, questionNumber);
}

function getQuestionFromDatabase(type, config, questionNumber) {
  let questions = [];
  
  if (type === 'technical') {
    const skill = config.skills[0]?.toLowerCase() || 'general';
    questions = questionDatabase.technical[skill] || questionDatabase.technical.general;
  } else if (type === 'behavioral') {
    questions = questionDatabase.behavioral;
  } else if (type === 'hr') {
    questions = questionDatabase.hr;
  } else {
    // Mixed - combine all
    questions = [
      ...questionDatabase.technical.general,
      ...questionDatabase.behavioral,
      ...questionDatabase.hr,
    ];
  }
  
  const index = (questionNumber - 1) % questions.length;
  return questions[index];
}

async function generateFeedback(session, answer, questionNumber) {
  // Try OpenAI first
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an interview coach providing constructive feedback. Be encouraging but honest. Provide a score from 1-10 and brief feedback.',
          },
          {
            role: 'user',
            content: `Evaluate this interview answer:\n\nQuestion: ${session.conversation.find((m) => m.questionNumber === questionNumber)?.content}\n\nAnswer: ${answer}\n\nProvide feedback in JSON format: {"score": number, "strengths": ["..."], "improvements": ["..."], "suggestion": "..."}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.5,
      });
      
      try {
        return JSON.parse(response.choices[0].message.content);
      } catch {
        return {
          score: 7,
          strengths: ['Good attempt'],
          improvements: ['Could be more detailed'],
          suggestion: 'Try to provide specific examples',
        };
      }
    } catch (error) {
      console.error('OpenAI error:', error);
    }
  }
  
  // Fallback feedback
  const answerLength = answer.length;
  let score = 5;
  
  if (answerLength > 200) score += 2;
  if (answerLength > 100) score += 1;
  if (answer.includes('example') || answer.includes('instance')) score += 1;
  
  return {
    score: Math.min(score, 10),
    strengths: answerLength > 100 ? ['Detailed response'] : ['Concise answer'],
    improvements: answerLength < 100 ? ['Could provide more details'] : [],
    suggestion: 'Consider using the STAR method for behavioral questions',
  };
}

async function generateResults(session) {
  const feedbacks = session.conversation
    .filter((m) => m.feedback)
    .map((m) => m.feedback);
  
  if (feedbacks.length === 0) {
    return {
      overallScore: 70,
      categoryScores: {
        technicalKnowledge: 70,
        communication: 70,
        problemSolving: 70,
        confidence: 70,
      },
      strengths: ['Completed the interview'],
      areasToImprove: ['Practice more'],
      recommendations: ['Keep practicing with mock interviews'],
      summary: 'You completed the interview. Keep practicing to improve your skills.',
    };
  }
  
  const avgScore = feedbacks.reduce((sum, f) => sum + (f.score || 5), 0) / feedbacks.length;
  const overallScore = Math.round(avgScore * 10);
  
  const allStrengths = feedbacks.flatMap((f) => f.strengths || []);
  const allImprovements = feedbacks.flatMap((f) => f.improvements || []);
  
  return {
    overallScore,
    categoryScores: {
      technicalKnowledge: overallScore + Math.floor(Math.random() * 10) - 5,
      communication: overallScore + Math.floor(Math.random() * 10) - 5,
      problemSolving: overallScore + Math.floor(Math.random() * 10) - 5,
      confidence: overallScore + Math.floor(Math.random() * 10) - 5,
    },
    strengths: [...new Set(allStrengths)].slice(0, 5),
    areasToImprove: [...new Set(allImprovements)].slice(0, 5),
    recommendations: [
      'Practice explaining your thought process out loud',
      'Use the STAR method for behavioral questions',
      'Research the company before real interviews',
    ],
    summary: `You scored ${overallScore}% in this mock interview. ${overallScore >= 70 ? 'Good job!' : 'Keep practicing to improve.'} Focus on ${allImprovements[0] || 'providing detailed answers'}.`,
  };
}
