const express = require('express');
const router = express.Router();

// These routes just render the EJS pages. All real data (products, cart,
// orders, etc.) is fetched client-side from the /api/... endpoints using
// fetch() with the JWT stored after login - see public/script.js.

// --- Auth pages ---
router.get('/login', (req, res) => res.render('auth/login'));
router.get('/register', (req, res) => res.render('auth/register'));

// --- User pages ---
router.get('/', (req, res) => res.render('user/home'));
router.get('/products', (req, res) => res.render('user/product'));
router.get('/products/:id', (req, res) => res.render('user/product-details'));
router.get('/cart', (req, res) => res.render('user/cart'));
router.get('/checkout', (req, res) => res.render('user/checkout'));
router.get('/my-orders', (req, res) => res.render('user/my-order'));
router.get('/order-success', (req, res) => res.render('user/order-success'));

// --- Admin pages ---
router.get('/admin/login', (req, res) => res.render('admin/login'));
router.get('/admin/dashboard', (req, res) => res.render('admin/dashboard'));
router.get('/admin/products', (req, res) => res.render('admin/products'));
router.get('/admin/products/add', (req, res) => res.render('admin/add-product'));
router.get('/admin/products/edit/:id', (req, res) => res.render('admin/edit-product'));
router.get('/admin/customers', (req, res) => res.render('admin/customers'));
router.get('/admin/orders', (req, res) => res.render('admin/orders'));

module.exports = router;
