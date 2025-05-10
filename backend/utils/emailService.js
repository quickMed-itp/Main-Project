const nodemailer = require('nodemailer');

// Check if email configuration is complete
const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Verify transporter configuration
const verifyTransporter = async (transporter) => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send order request email
const sendOrderRequestEmail = async (orderDetails) => {
  const { orderNumber, items, totalAmount, customerName, customerEmail } = orderDetails;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Order Request - ${orderNumber}`,
    html: `
      <h2>New Order Request</h2>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Customer Name:</strong> ${customerName}</p>
      <p><strong>Customer Email:</strong> ${customerEmail}</p>
      <p><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
      
      <h3>Order Items:</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
        </tr>
        ${items.map(item => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Rs. ${item.price}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Rs. ${item.quantity * item.price}</td>
          </tr>
        `).join('')}
      </table>
      
      <p>Please review this order and update its status accordingly.</p>
    `
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending order request email:', error);
    throw error;
  }
};

// Send low stock alert email
const sendLowStockAlert = async (products) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: 'Low Stock Alert',
    html: `
      <h2>Low Stock Alert</h2>
      <p>The following products are running low on stock:</p>
      
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">Product Name</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Current Stock</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Brand</th>
        </tr>
        ${products.map(product => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${product.totalStock}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${product.brand}</td>
          </tr>
        `).join('')}
      </table>
      
      <p>Please take necessary action to replenish the stock.</p>
    `
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
    throw error;
  }
};

// Send restock request email
const sendRestockRequestEmail = async (products) => {
  try {
    const transporter = createTransporter();
    const isConfigured = await verifyTransporter(transporter);

    if (!isConfigured) {
      throw new Error('Email service is not properly configured');
    }

    if (!process.env.SUPPLIER_EMAIL) {
      throw new Error('Supplier email address is not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPLIER_EMAIL,
      subject: 'Restock Request - QuickMed Pharmacy',
      html: `
        <h2>Restock Request</h2>
        <p>The following products require restocking:</p>
        <table border="1" cellpadding="5" style="border-collapse: collapse;">
          <tr>
            <th>Product Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Quantity</th>
          </tr>
          ${products.map(product => `
            <tr>
              <td>${product.name}</td>
              <td>${product.brand}</td>
              <td>${product.category}</td>
              <td>${product.currentStock}</td>
              <td>${product.recommendedQuantity}</td>
            </tr>
          `).join('')}
        </table>
        <p>Please process this restock request at your earliest convenience.</p>
        <p>Best regards,<br>QuickMed Pharmacy Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Restock request email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending restock request email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    const isConfigured = await verifyTransporter(transporter);
    
    if (!isConfigured) {
      throw new Error('Email service is not properly configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'Test Email - QuickMed Pharmacy',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the email configuration is working correctly.</p>
        <p>If you receive this email, your email service is properly configured.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderRequestEmail,
  sendLowStockAlert,
  sendRestockRequestEmail,
  testEmailConfiguration
};