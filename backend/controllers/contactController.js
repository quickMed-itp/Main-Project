const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    const contact = await Contact.create({
      name,
      email,
      phone,
      message
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        contact
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};