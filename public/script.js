// ===============================
// TECHKART - FRONTEND SCRIPT
// public/script.js
// ===============================

// Get the saved JWT token
const getToken = () => {
    return localStorage.getItem('token');
};

// Get logged-in user information
const getUser = () => {
    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;
};

// Save logged-in user data
const saveUserData = (data) => {
    localStorage.setItem('token', data.token);

    localStorage.setItem(
        'user',
        JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role
        })
    );
};

// Logout user
const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.location.href = '/login';
};

// Check whether user is logged in
const isLoggedIn = () => {
    return !!getToken();
};

// Helper for protected API requests
const authHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
};

console.log('Techkart script.js loaded successfully');

// ===============================
// LOGIN FUNCTIONALITY
// ===============================

const loginForm = document.querySelector('form[action="/login"]');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Login failed');
                return;
            }

            // Save token and user information
            saveUserData(data);

            alert('Login successful!');

            // Redirect admin or normal user
            if (data.role === 'admin') {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/';
            }

        } catch (error) {
            console.error('Login error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
}

// ===============================
// REGISTRATION FUNCTIONALITY
// ===============================

const registerForm = document.querySelector('form[action="/register"]');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone')
            ? document.getElementById('phone').value.trim()
            : '';

        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Registration failed');
                return;
            }

            // Save token and user information
            saveUserData(data);

            alert('Registration successful!');

            window.location.href = '/';

        } catch (error) {
            console.error('Registration error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
}

// ===============================
// LOGOUT FUNCTIONALITY
// ===============================

document.addEventListener('click', (event) => {
    const logoutLink = event.target.closest('a[href="/logout"]');

    if (logoutLink) {
        event.preventDefault();

        logoutUser();
    }
});

// ===============================
// PRODUCT API FUNCTIONS
// ===============================

// Get all products
const getProducts = async () => {
    try {
        const response = await fetch('/api/products');

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        return await response.json();

    } catch (error) {
        console.error('Product fetch error:', error);
        return [];
    }
};


// Get a single product by ID
const getProductById = async (productId) => {
    try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }

        return await response.json();

    } catch (error) {
        console.error('Single product fetch error:', error);
        return null;
    }
};

// ===============================
// PRODUCT FILTERING
// ===============================

const filterProducts = (products, options = {}) => {
    const {
        search = '',
        category = '',
        brand = '',
        minPrice = '',
        maxPrice = ''
    } = options;

    return products.filter((product) => {
        const productName = product.name?.toLowerCase() || '';
        const productBrand = product.brand?.toLowerCase() || '';
        const productCategory = product.category?.toLowerCase() || '';

        // Search filter
        const matchesSearch =
            !search ||
            productName.includes(search.toLowerCase()) ||
            productBrand.includes(search.toLowerCase());

        // Category filter
        const matchesCategory =
            !category ||
            productCategory === category.toLowerCase();

        // Brand filter
        const matchesBrand =
            !brand ||
            productBrand === brand.toLowerCase();

        // Minimum price
        const matchesMinPrice =
            !minPrice ||
            Number(product.price) >= Number(minPrice);

        // Maximum price
        const matchesMaxPrice =
            !maxPrice ||
            Number(product.price) <= Number(maxPrice);

        return (
            matchesSearch &&
            matchesCategory &&
            matchesBrand &&
            matchesMinPrice &&
            matchesMaxPrice
        );
    });
};

// ===============================
// CART API FUNCTIONS
// ===============================

// Get logged-in user's cart
const getCart = async () => {
    try {
        if (!isLoggedIn()) {
            return null;
        }

        const response = await fetch('/api/cart', {
            method: 'GET',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch cart');
        }

        return data;

    } catch (error) {
        console.error('Cart fetch error:', error);
        return null;
    }
};


// Add product to cart
const addProductToCart = async (productId, qty = 1) => {
    try {
        if (!isLoggedIn()) {
            alert('Please login first');
            window.location.href = '/login';
            return null;
        }

        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                productId,
                qty
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add product');
        }

        return data;

    } catch (error) {
        console.error('Add to cart error:', error);
        alert(error.message || 'Could not add product to cart');
        return null;
    }
};


// Update cart item quantity
const updateCartQuantity = async (productId, qty) => {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                qty
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update cart');
        }

        return data;

    } catch (error) {
        console.error('Update cart error:', error);
        return null;
    }
};


// Remove product from cart
const removeProductFromCart = async (productId) => {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove product');
        }

        return data;

    } catch (error) {
        console.error('Remove cart item error:', error);
        return null;
    }
};


// Clear entire cart
const clearUserCart = async () => {
    try {
        const response = await fetch('/api/cart', {
            method: 'DELETE',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to clear cart');
        }

        return data;

    } catch (error) {
        console.error('Clear cart error:', error);
        return null;
    }
};

// ===============================
// ORDER API FUNCTIONS
// ===============================

// Create a new order
const createOrder = async (orderData) => {
    try {
        if (!isLoggedIn()) {
            alert('Please login first');
            window.location.href = '/login';
            return null;
        }

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create order');
        }

        return data;

    } catch (error) {
        console.error('Create order error:', error);
        alert(error.message || 'Could not create order');
        return null;
    }
};


// Get logged-in user's orders
const getMyOrders = async () => {
    try {
        if (!isLoggedIn()) {
            return [];
        }

        const response = await fetch('/api/orders/myOrders', {
            method: 'GET',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch orders');
        }

        return data;

    } catch (error) {
        console.error('Fetch orders error:', error);
        return [];
    }
};

// ===============================
// PAYMENT API FUNCTIONS
// ===============================

// Create Razorpay payment order
const createPaymentOrder = async (amount) => {
    try {
        const response = await fetch('/api/payment/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create payment order');
        }

        return data;

    } catch (error) {
        console.error('Payment order error:', error);
        alert('Could not start payment');
        return null;
    }
};


// Verify Razorpay payment
const verifyPayment = async (paymentData) => {
    try {
        const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Payment verification failed');
        }

        return data;

    } catch (error) {
        console.error('Payment verification error:', error);
        return null;
    }
};

// ===============================
// ADMIN API FUNCTIONS
// ===============================

// Get admin dashboard statistics
const getAdminDashboard = async () => {
    try {
        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch dashboard data');
        }

        return data;

    } catch (error) {
        console.error('Admin dashboard error:', error);
        return null;
    }
};


// Get all customers
const getAdminCustomers = async () => {
    try {
        const response = await fetch('/api/admin/customers', {
            method: 'GET',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch customers');
        }

        return data;

    } catch (error) {
        console.error('Fetch customers error:', error);
        return [];
    }
};


// Get all orders
const getAdminOrders = async () => {
    try {
        const response = await fetch('/api/admin/orders', {
            method: 'GET',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch orders');
        }

        return data;

    } catch (error) {
        console.error('Fetch admin orders error:', error);
        return [];
    }
};


// Update an order status
const updateAdminOrderStatus = async (orderId, status) => {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                status
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update order status');
        }

        return data;

    } catch (error) {
        console.error('Update order status error:', error);
        return null;
    }
};

// ===============================
// CART PAGE EVENT HANDLERS
// ===============================

// Handle cart quantity update forms
document.addEventListener('submit', async (event) => {
    const updateForm = event.target.closest('form[action="/cart/update"]');

    if (!updateForm) return;

    event.preventDefault();

    const productId = updateForm.querySelector(
        'input[name="productId"]'
    ).value;

    const quantity = Number(
        updateForm.querySelector(
            'input[name="quantity"]'
        ).value
    );

    const result = await updateCartQuantity(productId, quantity);

    if (result) {
        window.location.reload();
    }
});


// Handle remove product forms
document.addEventListener('submit', async (event) => {
    const removeForm = event.target.closest(
        'form[action^="/cart/remove/"]'
    );

    if (!removeForm) return;

    event.preventDefault();

    const action = removeForm.getAttribute('action');

    const productId = action.split('/').pop();

    const result = await removeProductFromCart(productId);

    if (result) {
        window.location.reload();
    }
});

// ===============================
// CHECKOUT FUNCTIONALITY
// ===============================

const checkoutForm = document.querySelector(
    'form[action="/checkout"]'
);

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Check login
        if (!isLoggedIn()) {
            alert('Please login before placing an order');
            window.location.href = '/login';
            return;
        }

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();

        const street = document
            .getElementById('streetAddress')
            .value
            .trim();

        const city = document.getElementById('city').value.trim();

        const postalCode = document
            .getElementById('pincode')
            .value
            .trim();

        // Get current cart
        const cart = await getCart();

        if (!cart || !cart.items || cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Convert cart items to backend order format
        const orderItems = cart.items.map((item) => {
            const product = item.productId;

            return {
                productId: product._id || product,
                qty: item.qty || item.quantity || 1,
                price: product.price || item.price || 0
            };
        });

        // Calculate total amount
        const subtotal = orderItems.reduce((total, item) => {
            return total + item.price * item.qty;
        }, 0);

        const shippingFee = subtotal > 999 ? 0 : 99;

        const totalAmount = subtotal + shippingFee;

        // Create order data
        const orderData = {
            items: orderItems,
            totalAmount,
            address: {
                fullName,
                street,
                city,
                postalCode,

                // Your backend requires country
                country: 'India'
            },

            paymentId: ''
        };

        // Create order
        const createdOrder = await createOrder(orderData);

        if (createdOrder) {
            // Clear cart after successful order
            await clearUserCart();

            alert('Order placed successfully!');

            window.location.href = '/order-success';
        }
    });
}

async function loadMyOrders() {
    const ordersContainer = document.getElementById('orders-container');

    // Stop if we are not on the My Orders page
    if (!ordersContainer) return;

    const token = localStorage.getItem('token');

    if (!token) {
        ordersContainer.innerHTML = `
            <p>Please login to view your orders.</p>
            <a href="/login">Login</a>
        `;
        return;
    }

    try {
        const response = await fetch('/api/orders/myOrders', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const orders = await response.json();

        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <p>You have not placed any orders yet.</p>
                <a href="/products">Shop Now</a>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => {

            const itemsHTML = order.items.map(item => {

                // Backend may return product details or only the product ID
                const product = item.productId || {};

                const productName =
                    product.name || 'Product';

                const productImage =
                    product.imageUrl ||
                    product.image ||
                    '/images/default-gadget.png';

                const quantity = item.qty || 1;

                const price =
                    item.price ||
                    product.price ||
                    0;

                return `
                    <li class="order-item">
                        <img
                            src="${productImage}"
                            alt="${productName}"
                            width="60"
                        >

                        <div>
                            <strong>${productName}</strong>
                            <p>Quantity: ${quantity}</p>
                            <p>Price: ₹${price * quantity}</p>
                        </div>
                    </li>
                `;
            }).join('');

            const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : '';

            return `
                <article class="order-box">

                    <div class="order-header">
                        <p>
                            Order ID:
                            <strong>${order._id}</strong>
                        </p>

                        <p>
                            Date:
                            ${orderDate}
                        </p>

                        <p>
                            Status:
                            <strong>${order.status || 'Pending'}</strong>
                        </p>

                        <p>
                            Total:
                            <strong>₹${order.totalAmount}</strong>
                        </p>
                    </div>

                    <h3>Ordered Items</h3>

                    <ul class="order-items">
                        ${itemsHTML}
                    </ul>

                </article>
            `;
        }).join('');

    } catch (error) {
        console.error(error);

        ordersContainer.innerHTML = `
            <p>Unable to load your orders.</p>
        `;
    }
}

loadMyOrders();