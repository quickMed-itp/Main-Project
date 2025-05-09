const Contact = require('../models/Contact');
const AppError = require('../utils/appError');

// Submit contact form
exports.submitContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Create new contact entry
    const contact = new Contact({
      firstName,
      lastName,
      email,
      message
    });

    // Save to database
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      data: contact
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    next(new AppError('Error submitting contact form. Please try again.', 500));
  }
};

// Get all contact submissions (admin only)
exports.getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    next(new AppError('Error fetching contact submissions', 500));
  }
};