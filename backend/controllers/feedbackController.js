const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { name, email, feedback, rating, productId } = req.body;
    if (!productId) {
      return res.status(400).json({ status: 'fail', message: 'Product ID is required' });
    }
    const feedbackDoc = await Feedback.create({
      name,
      email,
      feedback,
      rating,
      productId,
      status: 'pending'
    });
    res.status(201).json({
      status: 'success',
      data: { feedback: feedbackDoc }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all feedback, optionally filter by productId
exports.getAllFeedback = async (req, res) => {
  try {
    const filter = {};
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }
    const feedbacks = await Feedback.find(filter);
    res.status(200).json({
      status: 'success',
      results: feedbacks.length,
      data: { feedbacks }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get feedback for a specific product
exports.getProductFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ productId: req.params.productId, status: 'approved' });
    res.status(200).json({
      status: 'success',
      results: feedbacks.length,
      data: { feedbacks }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ status: 'fail', message: 'No feedback found with that ID' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update feedback (edit content or status)
exports.updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!feedback) {
      return res.status(404).json({ status: 'fail', message: 'No feedback found with that ID' });
    }
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Approve feedback
exports.approveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ status: 'fail', message: 'No feedback found with that ID' });
    }
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Reject feedback
exports.rejectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ status: 'fail', message: 'No feedback found with that ID' });
    }
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};