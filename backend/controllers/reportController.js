const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');

// Color scheme
const colors = {
  primary: '#0D9488',       // Teal
  secondary: '#047857',     // Darker teal
  accent: '#10B981',        // Light teal
  text: '#374151',          // Dark gray
  lightText: '#6B7280',     // Medium gray
  background: '#F9FAFB',    // Light gray background
  white: '#FFFFFF',
  border: '#E5E7EB'         // Light border
};

// Helper function to create PDF with common elements
const createPDFDocument = () => {
  const marginInPoints = 0.25 * 72; // 0.25 inches to points
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'portrait',
    margins: {
      top: marginInPoints,
      bottom: marginInPoints,
      left: marginInPoints,
      right: marginInPoints
    }
  });

  // Add logo
  const logoPath = path.join(__dirname, '../upload/logo/weblogo.png');
  if (fs.existsSync(logoPath)) {
    const logoWidth = 100; // Slightly larger logo
    const logoX = (doc.page.width - logoWidth) / 2;
    doc.image(logoPath, logoX, marginInPoints, { width: logoWidth });
    doc.moveDown(1.5);
  }

  // Add title and address with styling
  doc.font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(colors.primary)
    .text('QuickMed Pharmacy', { align: 'center' })
    .font('Helvetica')
    .fontSize(12)
    .fillColor(colors.lightText)
    .text('668, New Shopping complex, Awissawella Rd, Wellampitiya', { align: 'center' })
    .moveDown(2);
  
  return doc;
};

// Helper function to add footer with page numbers
const addFooter = (doc, pageNumber, totalPages) => {
  const bottom = doc.page.height - (0.25 * 72); // 0.25 inches from bottom
  doc.fontSize(8)
    .fillColor(colors.lightText)
    .text(
      `Page ${pageNumber} of ${totalPages}`,
      0,
      bottom,
      { align: 'center', width: doc.page.width }
    );
};

// Helper function to create summary cards
const createSummaryCard = (doc, title, value, x, y, width, height) => {
  // Card container
  doc.roundedRect(x, y, width, height, 5)
    .fill(colors.white)
    .stroke(colors.border);
  
  // Title
  doc.font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(colors.lightText)
    .text(title.toUpperCase(), x + 10, y + 10, {
      width: width - 20,
      align: 'center'
    });
  
  // Value
  doc.font('Helvetica-Bold')
    .fontSize(18)
    .fillColor(colors.primary)
    .text(value, x + 10, y + 30, {
      width: width - 20,
      align: 'center'
    });
};

// Helper function to create table headers with borders
const createTableHeaders = (doc, headers, startX, startY, colWidths) => {
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const tableStartX = (doc.page.width - tableWidth) / 2;

  // Draw header background
  doc.fillColor(colors.primary)
    .roundedRect(tableStartX, startY, tableWidth, 25, 3)
    .fill();

  // Draw header text
  let currentX = tableStartX;
  headers.forEach((header, i) => {
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(colors.white)
      .text(header, currentX + 10, startY + 8, { 
        width: colWidths[i] - 20, 
        align: 'left' 
      });
    currentX += colWidths[i];
  });
  
  return { y: startY + 30, startX: tableStartX };
};

// Helper function to create table rows with borders
const createTableRow = (doc, data, startX, startY, colWidths) => {
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  
  // Draw row background (alternating colors)
  const isEven = Math.floor((startY - 30) / 25) % 2 === 0;
  doc.fillColor(isEven ? colors.background : colors.white)
    .rect(startX, startY, tableWidth, 25)
    .fill();
  
  // Draw row text
  let currentX = startX;
  doc.fillColor(colors.text);
  data.forEach((item, i) => {
    doc.font('Helvetica')
      .fontSize(9)
      .text(String(item), currentX + 10, startY + 8, { 
        width: colWidths[i] - 20, 
        align: 'left' 
      });
    currentX += colWidths[i];
  });

  // Draw row border
  doc.strokeColor(colors.border)
    .lineWidth(0.5)
    .rect(startX, startY, tableWidth, 25)
    .stroke();
  
  return startY + 25;
};

// Helper function to add report title and date
const addReportTitle = (doc, title) => {
  doc.font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(colors.primary)
    .text(title, { align: 'center' });
  
  // Add current date
  doc.font('Helvetica')
    .fontSize(10)
    .fillColor(colors.lightText)
    .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  
  doc.moveDown(1.5);
};

// Generate customer report
exports.generateCustomerReport = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' });
    const doc = createPDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=customer-report.pdf');
    
    doc.pipe(res);
    
    addReportTitle(doc, 'Customer Report');
    
    // Add summary cards
    const cardWidth = 120;
    const cardHeight = 60;
    const gap = (doc.page.width - (3 * cardWidth)) / 4;
    let x = gap;
    const y = doc.y;
    
    // Card 1: Total Customers
    createSummaryCard(doc, 'Total Customers', customers.length, x, y, cardWidth, cardHeight);
    
    // Card 2: New This Month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = customers.filter(c => c.createdAt >= thisMonth).length;
    x += cardWidth + gap;
    createSummaryCard(doc, 'New This Month', newThisMonth, x, y, cardWidth, cardHeight);
    
    // Card 3: Active Customers
    const activeCustomers = customers.filter(c => c.isActive).length;
    x += cardWidth + gap;
    createSummaryCard(doc, 'Active Customers', activeCustomers, x, y, cardWidth, cardHeight);
    
    doc.moveDown(4);
    
    // Add table
    const headers = ['No.', 'Name', 'Email', 'Phone', 'Joined Date'];
    const colWidths = [40, 150, 200, 100, 100];
    let { y: tableY, startX } = createTableHeaders(doc, headers, 50, doc.y, colWidths);

    customers.forEach((customer, index) => {
      if (tableY > doc.page.height - 100) {
        doc.addPage();
        addFooter(doc, 1, 2); // Update total pages if needed
        tableY = 100;
        createTableHeaders(doc, headers, 50, 80, colWidths);
      }
      
      tableY = createTableRow(doc, [
        index + 1,
        customer.name,
        customer.email,
        customer.phone || 'N/A',
        customer.createdAt.toLocaleDateString()
      ], startX, tableY, colWidths);
    });
    
    addFooter(doc, 1, 1);
    doc.end();
  } catch (error) {
    console.error('Error generating customer report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate order report
exports.generateOrderReport = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email');
    const doc = createPDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=order-report.pdf');
    
    doc.pipe(res);
    
    addReportTitle(doc, 'Order Report');
    
    // Add summary cards
    const cardWidth = 120;
    const cardHeight = 60;
    const gap = (doc.page.width - (3 * cardWidth)) / 4;
    let x = gap;
    const y = doc.y;
    
    // Card 1: Total Orders
    createSummaryCard(doc, 'Total Orders', orders.length, x, y, cardWidth, cardHeight);
    
    // Card 2: Total Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    x += cardWidth + gap;
    createSummaryCard(doc, 'Total Revenue', `Rs. ${totalRevenue.toFixed(2)}`, x, y, cardWidth, cardHeight);
    
    // Card 3: Avg. Order Value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    x += cardWidth + gap;
    createSummaryCard(doc, 'Avg. Order', `Rs. ${avgOrderValue.toFixed(2)}`, x, y, cardWidth, cardHeight);
    
    doc.moveDown(4);
    
    // Add table
    const headers = ['No.', 'Order ID', 'Customer', 'Amount', 'Status', 'Date'];
    const colWidths = [40, 100, 150, 80, 100, 100];
    let { y: tableY, startX } = createTableHeaders(doc, headers, 50, doc.y, colWidths);

    orders.forEach((order, index) => {
      if (tableY > doc.page.height - 100) {
        doc.addPage();
        addFooter(doc, 1, 2); // Update total pages if needed
        tableY = 100;
        createTableHeaders(doc, headers, 50, 80, colWidths);
      }
      
      tableY = createTableRow(doc, [
        index + 1,
        order._id.toString().slice(-6),
        order.userId.name,
        `Rs. ${order.totalAmount.toFixed(2)}`,
        order.status.charAt(0).toUpperCase() + order.status.slice(1),
        order.createdAt.toLocaleDateString()
      ], startX, tableY, colWidths);
    });
    
    addFooter(doc, 1, 1);
    doc.end();
  } catch (error) {
    console.error('Error generating order report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate prescription report
exports.generatePrescriptionReport = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('userId', 'name email');
    const doc = createPDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=prescription-report.pdf');
    
    doc.pipe(res);
    
    addReportTitle(doc, 'Prescription Report');

    // Add summary cards
    const cardWidth = 120;
    const cardHeight = 60;
    const gap = (doc.page.width - (3 * cardWidth)) / 4;
    let x = gap;
    const y = doc.y;
    
    // Card 1: Total Prescriptions
    createSummaryCard(doc, 'Total Prescriptions', prescriptions.length, x, y, cardWidth, cardHeight);
    
    // Card 2: Pending
    const pending = prescriptions.filter(p => p.status === 'pending').length;
    x += cardWidth + gap;
    createSummaryCard(doc, 'Pending', pending, x, y, cardWidth, cardHeight);
    
    // Card 3: Approved
    const approved = prescriptions.filter(p => p.status === 'approved').length;
    x += cardWidth + gap;
    createSummaryCard(doc, 'Approved', approved, x, y, cardWidth, cardHeight);
    
    doc.moveDown(4);
    
    // Add table
    const headers = ['No.', 'Patient', 'Age', 'Status', 'Date', 'Uploaded By'];
    const colWidths = [40, 150, 60, 100, 100, 150];
    let { y: tableY, startX } = createTableHeaders(doc, headers, 50, doc.y, colWidths);

    prescriptions.forEach((prescription, index) => {
      if (tableY > doc.page.height - 100) {
        doc.addPage();
        addFooter(doc, 1, 2); // Update total pages if needed
        tableY = 100;
        createTableHeaders(doc, headers, 50, 80, colWidths);
      }
      
      tableY = createTableRow(doc, [
        index + 1,
        prescription.patientName,
        prescription.patientAge,
        prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1),
        prescription.createdAt.toLocaleDateString(),
        prescription.userId.name
      ], startX, tableY, colWidths);
    });
    
    addFooter(doc, 1, 1);
    doc.end();
  } catch (error) {
    console.error('Error generating prescription report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate feedback report
exports.generateFeedbackReport = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'name');
    const doc = createPDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback-report.pdf');
    
    doc.pipe(res);
    
    addReportTitle(doc, 'Feedback Report');
    
    // Add summary cards
    const cardWidth = 120;
    const cardHeight = 60;
    const gap = (doc.page.width - (3 * cardWidth)) / 4;
    let x = gap;
    const y = doc.y;
    
    // Card 1: Total Feedbacks
    createSummaryCard(doc, 'Total Feedbacks', feedbacks.length, x, y, cardWidth, cardHeight);
    
    // Card 2: Average Rating
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    x += cardWidth + gap;
    createSummaryCard(doc, 'Avg. Rating', avgRating.toFixed(1), x, y, cardWidth, cardHeight);
    
    // Card 3: Positive (4-5 stars)
    const positive = feedbacks.filter(f => f.rating >= 4).length;
    x += cardWidth + gap;
    createSummaryCard(doc, 'Positive', positive, x, y, cardWidth, cardHeight);
    
    doc.moveDown(4);
    
    // Add table
    const headers = ['No.', 'User', 'Rating', 'Comment', 'Date'];
    const colWidths = [40, 150, 60, 200, 100];
    let { y: tableY, startX } = createTableHeaders(doc, headers, 50, doc.y, colWidths);

    feedbacks.forEach((feedback, index) => {
      if (tableY > doc.page.height - 100) {
        doc.addPage();
        addFooter(doc, 1, 2); // Update total pages if needed
        tableY = 100;
        createTableHeaders(doc, headers, 50, 80, colWidths);
      }
      
      // Create star rating visualization
      const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
      
      tableY = createTableRow(doc, [
        index + 1,
        feedback.userId.name,
        stars,
        feedback.comment.length > 50 ? feedback.comment.substring(0, 50) + '...' : feedback.comment,
        feedback.createdAt.toLocaleDateString()
      ], startX, tableY, colWidths);
    });
    
    addFooter(doc, 1, 1);
    doc.end();
  } catch (error) {
    console.error('Error generating feedback report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate inventory report
exports.generateInventoryReport = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: 'batches',
        select: 'batchNumber manufacturingDate expiryDate quantity status',
        options: { sort: { manufacturingDate: -1 } }
      })
      .sort({ name: 1 });

    const doc = createPDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.pdf');
    
    doc.pipe(res);
    
    addReportTitle(doc, 'Inventory Report');
    
    // Add summary cards
    const cardWidth = 120;
    const cardHeight = 60;
    const gap = (doc.page.width - (4 * cardWidth)) / 5;
    let x = gap;
    const y = doc.y;
    
    // Calculate summary statistics
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.totalStock > 0).length;
    const outOfStockProducts = products.filter(p => p.totalStock === 0).length;
    const totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
    
    // Card 1: Total Products
    createSummaryCard(doc, 'Total Products', totalProducts, x, y, cardWidth, cardHeight);
    
    // Card 2: In Stock
    x += cardWidth + gap;
    createSummaryCard(doc, 'In Stock', inStockProducts, x, y, cardWidth, cardHeight);
    
    // Card 3: Out of Stock
    x += cardWidth + gap;
    createSummaryCard(doc, 'Out of Stock', outOfStockProducts, x, y, cardWidth, cardHeight);
    
    // Card 4: Total Stock
    x += cardWidth + gap;
    createSummaryCard(doc, 'Total Stock', totalStock, x, y, cardWidth, cardHeight);
    
    doc.moveDown(4);
    
    // Add table
    const headers = ['No.', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Batches'];
    const colWidths = [40, 180, 120, 80, 60, 80, 80];
    let { y: tableY, startX } = createTableHeaders(doc, headers, 50, doc.y, colWidths);

    products.forEach((product, index) => {
      if (tableY > doc.page.height - 100) {
        doc.addPage();
        addFooter(doc, 1, 2); // Update total pages if needed
        tableY = 100;
        createTableHeaders(doc, headers, 50, 80, colWidths);
      }
      
      const stock = product.totalStock || 0;
      const stockStatus = stock > 0 ? 
        { text: 'In Stock', color: colors.secondary } : 
        { text: 'Out of Stock', color: '#EF4444' };
      
      // Count active batches
      const activeBatches = product.batches.filter(batch => 
        batch.status === 'active' && new Date(batch.expiryDate) > new Date()
      ).length;
      
      tableY = createTableRow(doc, [
        index + 1,
        product.name,
        product.category,
        `Rs. ${parseFloat(product.price).toFixed(2)}`,
        stock.toString(),
        stockStatus.text,
        activeBatches.toString()
      ], startX, tableY, colWidths);
    });
    
    addFooter(doc, 1, 1);
    doc.end();
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ message: error.message });
  }
};