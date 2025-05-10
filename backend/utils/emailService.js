const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true // Enable debug logging
});

// Function to send low stock alert email
const sendLowStockAlert = async (products) => {
  // Validate email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration missing:', {
      hasUser: !!process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD
    });
    throw new Error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
  }

  try {
    console.log('Verifying email configuration...');
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email configuration verified successfully');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hbrajitha@gmail.com',
      subject: 'Low Stock Alert - QuickMed Pharmacy',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488;">Low Stock Alert</h2>
          <p>The following products are running low on stock and need to be replenished:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Product Name</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Current Stock</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Brand</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Category</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${product.name}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${product.totalStock}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${product.brand}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${product.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="color: #dc2626; font-weight: bold;">Please arrange for the supply of these products as soon as possible.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">This is an automated message from QuickMed Pharmacy Inventory System.</p>
          </div>
        </div>
      `
    };

    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Low stock alert email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Detailed error sending low stock alert email:', {
      error: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendLowStockAlert
}; 