const OrderAdmin = require('../models/OrderAdmin');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const order = new OrderAdmin(req.body);
        await order.save();
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await OrderAdmin.find();
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await OrderAdmin.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update order
exports.updateOrder = async (req, res) => {
    try {
        const order = await OrderAdmin.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await OrderAdmin.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
    try {
        const orders = await OrderAdmin.find({ status: req.params.status });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 