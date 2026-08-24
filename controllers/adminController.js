const User = require('../model/User');
const Order = require('../model/Order');
const Product = require('../model/Product');

// Small stats block for the admin dashboard
const getDashboardStats = async (req, res) => {
    try {
        const [userCount, productCount, orderCount, orders] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.find({})
        ]);
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({ userCount, productCount, orderCount, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// List all customers (non-admin users)
const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' }).select('-password');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// List every order, most recent first, with buyer + product info populated
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .populate('items.productId', 'name price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an order's status (Pending / Shipped / Delivered)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getCustomers, getAllOrders, updateOrderStatus };
