const Cart = require('../model/Cart');

// Get logged-in user's cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a product to the cart (or increase qty if it's already there)
const addToCart = async (req, res) => {
    try {
        const { productId, qty } = req.body;
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }

        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.qty += qty || 1;
        } else {
            cart.items.push({ productId, qty: qty || 1 });
        }

        await cart.save();
        const populatedCart = await cart.populate('items.productId');
        res.status(201).json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the quantity of one item in the cart
const updateCartItem = async (req, res) => {
    try {
        const { qty } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === req.params.productId);
        if (!item) {
            return res.status(404).json({ message: 'Item not in cart' });
        }

        if (qty <= 0) {
            cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        } else {
            item.qty = qty;
        }

        await cart.save();
        const populatedCart = await cart.populate('items.productId');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove one item from the cart
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        await cart.save();
        const populatedCart = await cart.populate('items.productId');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Empty the whole cart (used after an order is placed)
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
