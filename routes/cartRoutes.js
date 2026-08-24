const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// every cart action requires a logged-in user
router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/:productId').put(protect, updateCartItem).delete(protect, removeFromCart);

module.exports = router;
