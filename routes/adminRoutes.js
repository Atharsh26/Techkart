const express = require('express');
const { getDashboardStats, getCustomers, getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

// every admin route requires a logged-in admin
router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/customers', protect, admin, getCustomers);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id', protect, admin, updateOrderStatus);

// Note: adding/editing/deleting products is already handled by routes/productRoutes.js
// (POST/PUT/DELETE on /api/products), which is already protect + admin guarded.

module.exports = router;
