const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { name, email, feedback, rating } = req.body;
    
    const feedbackDoc = await Feedback.create({
      name,
      email,
      feedback,
      rating
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        feedback: feedbackDoc
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};