const Support = require('../models/Support');

// Get all support tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Support.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: {
        tickets
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single support ticket
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'No ticket found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new support ticket
exports.createTicket = async (req, res) => {
  try {
    const newTicket = await Support.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        ticket: newTicket
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a support ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'No ticket found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a support ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Support.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'No ticket found with that ID'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update ticket status
exports.updateStatus = async (req, res) => {
  try {
    const { status, reply } = req.body;
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { status, reply },
      {
        new: true,
        runValidators: true
      }
    );
    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'No ticket found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
}; 
