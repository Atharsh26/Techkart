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

    // Brand can be one name, or several from the checkbox filters, so
    // normalize it to an array of lowercase names for matching.
    const brandList = (Array.isArray(brand) ? brand : [brand])
        .filter(Boolean)
        .map((b) => b.toLowerCase());

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

        // Brand filter (matches if the product's brand is any of the checked ones)
        const matchesBrand =
            brandList.length === 0 ||
            brandList.includes(productBrand);

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


// Delete a product
const deleteAdminProduct = async (productId) => {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete product');
        }

        return data;

    } catch (error) {
        console.error('Delete product error:', error);
        alert(error.message || 'Could not delete product');
        return null;
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

        const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentId = paymentMethodInput ? paymentMethodInput.value : 'COD';

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

            paymentId
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

// ===============================
// ADMIN LOGIN (the existing loginForm handler above only
// listens for form[action="/login"] - the admin login page
// posts to /admin/login, so it needs its own handler)
// ===============================

const adminLoginForm = document.querySelector('form[action="/admin/login"]');

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Login failed');
                return;
            }

            if (data.role !== 'admin') {
                alert('This account does not have admin access.');
                return;
            }

            saveUserData(data);
            window.location.href = '/admin/dashboard';

        } catch (error) {
            console.error('Admin login error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
}

// ===============================
// ADMIN - ADD PRODUCT
// (the form posts to /admin/products/add, but that's just the page route -
// there's no server route that handles the POST, and a plain form submit
// couldn't include the admin's JWT anyway. So, same pattern as the other
// forms above, intercept the submit and call the protected API instead.)
// ===============================

const addProductForm = document.querySelector('form[action="/admin/products/add"]');

if (addProductForm) {
    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!isLoggedIn()) {
            alert('Please login as an admin first');
            window.location.href = '/admin/login';
            return;
        }

        const name = document.getElementById('name').value.trim();
        const brand = document.getElementById('brand').value.trim();
        const category = document.getElementById('category').value;
        const price = Number(document.getElementById('price').value);
        const originalPrice = document.getElementById('originalPrice').value
            ? Number(document.getElementById('originalPrice').value)
            : undefined;
        const stock = Number(document.getElementById('stock').value);
        const imageUrl = document.getElementById('image').value.trim();
        const description = document.getElementById('description').value.trim();

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    name,
                    brand,
                    category,
                    price,
                    originalPrice,
                    stock,
                    imageUrl,
                    description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Failed to add product');
                return;
            }

            alert('Product added successfully!');
            window.location.href = '/admin/dashboard';

        } catch (error) {
            console.error('Add product error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
}

// ===============================
// ADMIN - EDIT PRODUCT
// Loads the existing product into the form (id comes from the URL,
// e.g. /admin/products/edit/<id>), then PUTs the changes back on submit.
// ===============================

const editProductForm = document.getElementById('edit-product-form');

if (editProductForm) {
    const productId = window.location.pathname.split('/').filter(Boolean).pop();

    (async function loadProductIntoForm() {
        if (!isLoggedIn()) {
            alert('Please login as an admin first');
            window.location.href = '/admin/login';
            return;
        }

        const product = await getProductById(productId);

        if (!product) {
            alert('Product not found');
            window.location.href = '/admin/products';
            return;
        }

        document.getElementById('name').value = product.name || '';
        document.getElementById('brand').value = product.brand || '';
        document.getElementById('category').value = product.category || '';
        document.getElementById('price').value = product.price ?? '';
        document.getElementById('originalPrice').value = product.originalPrice ?? '';
        document.getElementById('stock').value = product.stock ?? '';
        document.getElementById('image').value = product.imageUrl || '';
        document.getElementById('description').value = product.description || '';
    })();

    editProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const brand = document.getElementById('brand').value.trim();
        const category = document.getElementById('category').value;
        const price = Number(document.getElementById('price').value);
        const originalPrice = document.getElementById('originalPrice').value
            ? Number(document.getElementById('originalPrice').value)
            : undefined;
        const stock = Number(document.getElementById('stock').value);
        const imageUrl = document.getElementById('image').value.trim();
        const description = document.getElementById('description').value.trim();

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    name,
                    brand,
                    category,
                    price,
                    originalPrice,
                    stock,
                    imageUrl,
                    description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Failed to update product');
                return;
            }

            alert('Product updated successfully!');
            window.location.href = '/admin/products';

        } catch (error) {
            console.error('Update product error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
}

// ===============================
// SMALL SHARED HELPERS FOR RENDERING
// ===============================

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function formatMoney(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

// ---------- Amazon/Flipkart-style helpers ----------
function renderStars(rating) {
    const r = Math.round(Number(rating || 0) * 2) / 2; // nearest half star
    let out = '';
    for (let i = 1; i <= 5; i++) {
        if (r >= i) out += '★';
        else if (r >= i - 0.5) out += '⯨';
        else out += '☆';
    }
    return out;
}
function discountPercent(price, originalPrice) {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
}
function getWishlist() {
    try { return JSON.parse(localStorage.getItem('tk_wishlist') || '[]'); } catch (e) { return []; }
}
function isWishlisted(id) { return getWishlist().includes(id); }
function toggleWishlist(id) {
    let list = getWishlist();
    if (list.includes(id)) list = list.filter(x => x !== id);
    else list.push(id);
    localStorage.setItem('tk_wishlist', JSON.stringify(list));
    return list.includes(id);
}

// Delegate wishlist heart clicks (buttons are generated dynamically)
document.addEventListener('click', (event) => {
    const btn = event.target.closest('.wishlist-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    const nowWishlisted = toggleWishlist(id);
    btn.classList.toggle('active', nowWishlisted);
    btn.textContent = nowWishlisted ? '♥' : '♡';
});

function productCardHtml(p) {
    const id = p._id || p.id;
    const discount = discountPercent(p.price, p.originalPrice);
    const wishlisted = isWishlisted(id);
    return `
    <div class="product-card">
        <div class="product-image-wrap">
            ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
            <button type="button" class="wishlist-btn ${wishlisted ? 'active' : ''}" data-id="${id}" aria-label="Add to wishlist">${wishlisted ? '♥' : '♡'}</button>
            <img src="${escapeHtml(p.imageUrl) || '/images/default-gadget.png'}" alt="${escapeHtml(p.name)}">
        </div>
        <p class="category">${escapeHtml(p.category)}</p>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="brand">${escapeHtml(p.brand)}</p>
        ${p.ratings ? `<p class="rating-pill"><span>${Number(p.ratings).toFixed(1)} ★</span> <span class="review-count">(${p.numReviews || 0})</span></p>` : ''}
        <p class="price">${formatMoney(p.price)}</p>
        ${p.originalPrice ? `<p class="original-price"><del>${formatMoney(p.originalPrice)}</del> <span class="discount-text">${discount}% off</span></p>` : ''}
        <div class="card-buttons">
            <a href="/products/${id}">View Details</a>
            <form action="/cart/add/${id}" method="POST">
                <input type="hidden" name="quantity" value="1">
                <button type="submit">Add to Cart</button>
            </form>
        </div>
    </div>`;
}

// Add-to-cart forms are generated dynamically by the functions below, so we
// use event delegation (same pattern as the cart update/remove handlers above)
// rather than attaching a listener to each button individually.
document.addEventListener('submit', async (event) => {
    const addForm = event.target.closest('form[action^="/cart/add/"], form.pdp-buy-form');
    if (!addForm) return;

    // A "Buy Now" button can override the form's action via formaction
    const submitter = event.submitter;
    const effectiveAction = (submitter && submitter.getAttribute('formaction')) || addForm.getAttribute('action');
    if (!effectiveAction || !effectiveAction.startsWith('/cart/add/')) return;

    event.preventDefault();

    const [pathPart, queryPart] = effectiveAction.split('?');
    const productId = pathPart.split('/').pop();
    const buyNow = queryPart && queryPart.includes('buyNow=1');
    const qtyInput = addForm.querySelector('input[name="quantity"]');
    const qty = qtyInput ? Number(qtyInput.value) || 1 : 1;

    const result = await addProductToCart(productId, qty);
    if (result) {
        if (buyNow) {
            window.location.href = '/checkout';
        } else {
            alert('Added to cart!');
        }
    }
});

// ===============================
// HOME PAGE - render featured products
// ===============================
(async function renderHomeProducts() {
    const grid = document.querySelector('.featured-products .product-grid');
    if (!grid) return; // not on the home page

    const products = await getProducts();
    const featured = products.slice(0, 6);
    grid.innerHTML = featured.length
        ? featured.map(productCardHtml).join('')
        : '<p>No products available at the moment.</p>';
})();

// ===============================
// PRODUCTS CATALOG PAGE - render + filter
// ===============================
(async function renderProductsPage() {
    const filterForm = document.querySelector('.filters-sidebar form[action="/products"]');
    if (!filterForm) return; // not on the products page

    const grid = document.querySelector('.products-section .product-grid');
    const countEl = document.getElementById('product-count');
    const params = new URLSearchParams(window.location.search);

    // Pre-fill the filter form from the URL so it reflects the current filters
    if (params.get('search')) filterForm.search.value = params.get('search');
    if (params.get('minPrice')) filterForm.minPrice.value = params.get('minPrice');
    if (params.get('maxPrice')) filterForm.maxPrice.value = params.get('maxPrice');
    const categoryParam = params.get('category') || '';
    const catRadio = filterForm.querySelector(`input[name="category"][value="${categoryParam}"]`);
    if (catRadio) catRadio.checked = true;

    const brandParams = params.getAll('brand');
    brandParams.forEach((b) => {
        const brandCheckbox = filterForm.querySelector(`input[name="brand"][value="${b}"]`);
        if (brandCheckbox) brandCheckbox.checked = true;
    });

    const allProducts = await getProducts();
    const filtered = filterProducts(allProducts, {
        search: params.get('search') || '',
        category: categoryParam,
        brand: brandParams,
        minPrice: params.get('minPrice') || '',
        maxPrice: params.get('maxPrice') || ''
    });

    if (countEl) countEl.textContent = filtered.length;
    grid.innerHTML = filtered.length
        ? filtered.map(productCardHtml).join('')
        : '<p>No products found matching the criteria.</p>';
})();

// ===============================
// PRODUCT DETAILS PAGE
// ===============================
(async function renderProductDetails() {
    const container = document.getElementById('product-details-content');
    if (!container) return; // not on the product details page

    const id = window.location.pathname.split('/').filter(Boolean).pop();
    const product = await getProductById(id);

    if (!product) {
        container.innerHTML = `<p>Product not found.</p><a href="/products">Back to Products</a>`;
        return;
    }

    const discount = discountPercent(product.price, product.originalPrice);
    const wishlisted = isWishlisted(product._id);
    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    container.innerHTML = `
        <nav aria-label="breadcrumb">
            <a href="/">Home</a> &gt; <a href="/products">Products</a> &gt; <span>${escapeHtml(product.name)}</span>
        </nav>
        <article class="product-details-container">
            <div class="product-gallery">
                <button type="button" class="wishlist-btn details-wishlist ${wishlisted ? 'active' : ''}" data-id="${product._id}" aria-label="Add to wishlist">${wishlisted ? '♥' : '♡'}</button>
                <img id="main-product-img" src="${escapeHtml(product.imageUrl) || '/images/default-gadget.png'}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="product-info">
                <h1>${escapeHtml(product.name)}</h1>
                <p class="brand">Brand: <strong>${escapeHtml(product.brand || 'N/A')}</strong></p>
                ${product.ratings ? `<p class="rating-pill"><span>${Number(product.ratings).toFixed(1)} ★</span> <span class="review-count">${product.numReviews || 0} ratings</span></p>` : ''}
                <p class="category">Category: <strong>${escapeHtml(product.category)}</strong></p>

                <div class="price-block">
                    <span class="price">${formatMoney(product.price)}</span>
                    ${product.originalPrice ? `<del class="original-price">${formatMoney(product.originalPrice)}</del>` : ''}
                    ${discount > 0 ? `<span class="discount-text">${discount}% off</span>` : ''}
                </div>
                <span class="assured-badge">✔ Techkart Assured</span>

                <p class="stock-status">Status: <strong>${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</strong></p>

                <div class="delivery-info">
                    <p>🚚 Delivery by <strong>${deliveryDate}</strong></p>
                    <p>Free delivery on orders above ₹999</p>
                </div>

                <form action="/cart/add/${product._id}" method="POST" class="pdp-buy-form">
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" value="1" min="1" max="${product.stock || 10}">
                    <div class="pdp-action-buttons">
                        <button type="submit" class="btn-add-cart" ${product.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>
                        <button type="submit" formaction="/cart/add/${product._id}?buyNow=1" class="btn-buy-now" ${product.stock <= 0 ? 'disabled' : ''}>Buy Now</button>
                    </div>
                </form>

                <div class="description-section">
                    <h3>Description</h3>
                    <p>${escapeHtml(product.description || 'No description available for this product.')}</p>
                </div>

                <div class="specifications-section">
                    <h3>Specifications</h3>
                    <table>
                        <tbody>
                            <tr><th>Brand</th><td>${escapeHtml(product.brand || 'N/A')}</td></tr>
                            <tr><th>Category</th><td>${escapeHtml(product.category || 'N/A')}</td></tr>
                            <tr><th>Warranty</th><td>1 Year Official Brand Warranty</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </article>`;
})();

// ===============================
// CART PAGE - render items into #cart-page-content
// (the update/remove submit handlers already defined above
// keep working unchanged since we reuse the same form actions)
// ===============================
(async function renderCartPage() {
    const content = document.getElementById('cart-page-content');
    if (!content) return; // not on the cart page

    async function draw() {
        const cart = await getCart();
        const items = (cart && cart.items) || [];

        if (!items.length) {
            content.innerHTML = `<p>Your cart is empty.</p><a href="/products">Explore Products</a>`;
            return;
        }

        let subtotal = 0;
        const rows = items.map(item => {
            const p = item.productId || {};
            const qty = item.qty || item.quantity || 1;
            const price = p.price || item.price || 0;
            subtotal += price * qty;
            const pid = p._id || item.productId;
            return `
            <tr>
                <td><img src="${escapeHtml(p.imageUrl) || '/images/default-gadget.png'}" alt="${escapeHtml(p.name)}" width="60"><strong>${escapeHtml(p.name || 'Gadget Item')}</strong></td>
                <td>${formatMoney(price)}</td>
                <td>
                    <form action="/cart/update" method="POST">
                        <input type="hidden" name="productId" value="${pid}">
                        <input type="number" name="quantity" value="${qty}" min="1" max="10">
                        <button type="submit">Update</button>
                    </form>
                </td>
                <td>${formatMoney(price * qty)}</td>
                <td>
                    <form action="/cart/remove/${pid}" method="POST">
                        <button type="submit">Remove</button>
                    </form>
                </td>
            </tr>`;
        }).join('');

        const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
        const finalTotal = subtotal + shippingFee;

        content.innerHTML = `
            <div class="cart-container">
                <table border="1" cellpadding="10" cellspacing="0">
                    <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <aside class="cart-summary">
                    <h2>Order Summary</h2>
                    <p>Subtotal: <strong>${formatMoney(subtotal)}</strong></p>
                    <p>Shipping: <strong>${shippingFee === 0 ? 'FREE' : formatMoney(shippingFee)}</strong></p>
                    <hr>
                    <h3>Grand Total: <strong>${formatMoney(finalTotal)}</strong></h3>
                    <a href="/checkout">Proceed to Checkout</a><br><br>
                    <a href="/products">Continue Shopping</a>
                </aside>
            </div>`;
    }
    await draw();
})();

// ===============================
// CHECKOUT PAGE - fill in the order summary
// (the checkoutForm submit handler above already reads the
// live cart at submit time, this just displays it up front)
// ===============================
(async function renderCheckoutSummary() {
    const itemsList = document.getElementById('checkout-items');
    if (!itemsList) return; // not on the checkout page

    const cart = await getCart();
    const items = (cart && cart.items) || [];

    if (!items.length) {
        document.querySelector('form[action="/checkout"]').innerHTML =
            '<p>Your cart is empty. <a href="/products">Go shopping</a></p>';
        return;
    }

    let subtotal = 0;
    itemsList.innerHTML = items.map(item => {
        const p = item.productId || {};
        const qty = item.qty || item.quantity || 1;
        const price = p.price || item.price || 0;
        subtotal += price * qty;
        return `<li>${escapeHtml(p.name || 'Product')} (Qty: ${qty}) - ${formatMoney(price * qty)}</li>`;
    }).join('');

    const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
    document.getElementById('checkout-subtotal').textContent = subtotal.toLocaleString('en-IN');
    document.getElementById('checkout-shipping').textContent = shippingFee === 0 ? 'FREE' : formatMoney(shippingFee);
    document.getElementById('checkout-total').textContent = (subtotal + shippingFee).toLocaleString('en-IN');
})();

// ===============================
// ADMIN DASHBOARD
// ===============================
(async function renderAdminDashboard() {
    const revenueEl = document.getElementById('kpi-revenue');
    if (!revenueEl) return; // not on the admin dashboard page

    const stats = await getAdminDashboard();
    if (stats) {
        document.getElementById('kpi-revenue').textContent = Number(stats.totalRevenue || 0).toLocaleString('en-IN');
        document.getElementById('kpi-orders').textContent = stats.orderCount || 0;
        document.getElementById('kpi-products').textContent = stats.productCount || 0;
        document.getElementById('kpi-customers').textContent = stats.userCount || 0;
    }

    const orders = await getAdminOrders();
    const body = document.getElementById('recent-orders-body');
    const recent = (orders || []).slice(0, 5);
    body.innerHTML = recent.length ? recent.map(ord => `
        <tr>
            <td>${ord._id}</td>
            <td>${escapeHtml((ord.address && ord.address.fullName) || (ord.userId && ord.userId.name) || 'Customer')}</td>
            <td>${formatMoney(ord.totalAmount)}</td>
            <td>${escapeHtml(ord.paymentId || 'Online')}</td>
            <td>${escapeHtml(ord.status || 'Processing')}</td>
            <td><a href="/admin/orders">Manage</a></td>
        </tr>`).join('') : '<tr><td colspan="6">No recent orders.</td></tr>';
})();

// ===============================
// ADMIN CUSTOMERS
// ===============================
(async function renderAdminCustomers() {
    const body = document.getElementById('customers-body');
    if (!body) return; // not on the customers page

    const customers = await getAdminCustomers();
    body.innerHTML = customers.length ? customers.map(c => `
        <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone || 'N/A')}</td>
            <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</td>
            <td>-</td>
            <td>-</td>
        </tr>`).join('') : '<tr><td colspan="6">No customers registered yet.</td></tr>';
})();

// ===============================
// ADMIN PRODUCTS - render + delete
// ===============================
(async function renderAdminProducts() {
    const body = document.getElementById('admin-products-body');
    if (!body) return; // not on the manage-products page

    async function draw() {
        const products = await getProducts();
        body.innerHTML = products.length ? products.map(p => `
            <tr>
                <td><img src="${escapeHtml(p.imageUrl) || '/images/default-gadget.png'}" alt="${escapeHtml(p.name)}" width="50"></td>
                <td>${escapeHtml(p.name)}</td>
                <td>${escapeHtml(p.brand || 'N/A')}</td>
                <td>${escapeHtml(p.category)}</td>
                <td>${formatMoney(p.price)}</td>
                <td>${p.stock}</td>
                <td>
                    <a href="/admin/products/edit/${p._id}">Edit</a>
                    <button type="button" class="delete-product-btn" data-id="${p._id}">Delete</button>
                </td>
            </tr>`).join('') : '<tr><td colspan="7">No products in the catalog yet.</td></tr>';

        body.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const row = btn.closest('tr');
                const productName = row.children[1].textContent;

                if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;

                const result = await deleteAdminProduct(id);
                if (result) draw();
            });
        });
    }
    await draw();
})();

// ===============================
// ADMIN ORDERS - render + status update
// ===============================
(async function renderAdminOrders() {
    const body = document.getElementById('admin-orders-body');
    if (!body) return; // not on the admin orders page

    const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

    async function draw() {
        const orders = await getAdminOrders();
        body.innerHTML = orders.length ? orders.map(ord => `
            <tr>
                <td>${ord._id}</td>
                <td>${escapeHtml((ord.address && ord.address.fullName) || (ord.userId && ord.userId.name) || 'Customer')}</td>
                <td>${ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ''}</td>
                <td>${formatMoney(ord.totalAmount)}</td>
                <td>${escapeHtml(ord.paymentId || 'Online')}</td>
                <td>${escapeHtml(ord.status || 'Processing')}</td>
                <td>
                    <select class="status-select" data-id="${ord._id}">
                        ${statuses.map(s => `<option value="${s}" ${ord.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <button type="button" class="update-status-btn" data-id="${ord._id}">Update</button>
                </td>
            </tr>`).join('') : '<tr><td colspan="7">No orders recorded in the system.</td></tr>';

        body.querySelectorAll('.update-status-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const status = body.querySelector(`.status-select[data-id="${id}"]`).value;
                const result = await updateAdminOrderStatus(id, status);
                if (result) draw();
            });
        });
    }
    await draw();
})();
// ===============================
// HOME PAGE HERO SLIDESHOW
// ===============================
(function initHeroSlideshow() {
    const container = document.getElementById('hero-slideshow');
    if (!container) return; // not on the home page

    const slides = container.querySelectorAll('.hero-slide');
    const dots = container.querySelectorAll('.hero-dot');
    let current = 0;
    let timer;

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
        timer = setInterval(next, 5000);
    }
    function stopAutoplay() {
        clearInterval(timer);
    }

    document.getElementById('hero-next').addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });
    document.getElementById('hero-prev').addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goTo(i); stopAutoplay(); startAutoplay(); });
    });

    startAutoplay();
})();

// ===============================
// DARK MODE TOGGLE
// Defaults to dark (see the inline no-flash script in every page's <head>,
// which sets data-theme from localStorage - or "dark" if nothing is saved
// yet - before the page paints).
// ===============================
(function initThemeToggle() {
    const STORAGE_KEY = 'techkart-theme';
    const btn = document.getElementById('theme-toggle');

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function syncIcon() {
        if (!btn) return;
        btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
    }

    syncIcon();

    if (btn) {
        btn.addEventListener('click', () => {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
            syncIcon();
        });
    }
})();
