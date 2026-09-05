# Techkart 🛒

A full-stack e-commerce web application built with **Node.js**, **Express**, **MongoDB**, and **EJS**. Techkart supports product browsing, cart management, checkout with COD/online payment, order tracking, and a full admin panel for managing products, orders, and customers.

---

## Features

### Customer
- Browse products with search, category, brand, and price filters
- Product detail pages with ratings, stock status, and delivery estimates
- Cart management (add, update quantity, remove, clear)
- Checkout with Cash on Delivery or Razorpay online payment
- Order history and order confirmation emails
- Light/Dark theme toggle
- JWT-based authentication (register/login)

### Admin
- Secure admin login (JWT + role-based access)
- Dashboard with revenue, order, product, and customer stats
- Add new products (name, brand, category, price, stock, image URL, description)
- Manage products — view all products and delete them
- Manage orders — view all orders and update order status
- View registered customers

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB with Mongoose                |
| Frontend   | EJS templates, vanilla JavaScript, CSS |
| Auth       | JSON Web Tokens (JWT), bcryptjs      |
| Payments   | Razorpay                             |
| Email      | Nodemailer (Gmail)                   |
| File/Image | Multer, Cloudinary                   |

---

## Project Structure

```
Techkart/
├── config/            # Database & Cloudinary configuration
├── controllers/       # Route logic (auth, products, cart, orders, payments, admin)
├── middleware/        # Auth & admin route guards
├── model/             # Mongoose schemas (User, Product, Cart, Order)
├── public/            # Static frontend assets (script.js, style.css)
├── routes/            # Express route definitions
├── utils/             # Helper functions (email sender)
├── views/             # EJS templates (user, auth, admin)
├── uploads/           # Temporary storage for uploaded images
├── seed.js            # Seeds the database with an admin user + sample products
├── server.js          # App entry point
└── .env               # Environment variables (not committed)
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally, or a MongoDB Atlas connection string

### Installation

1. Clone the repository
```bash
   git clone <repo-url>
   cd Techkart
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below)

4. Seed the database with an admin account and sample products
```bash
   npm run seed
```

5. Start the server
```bash
   npm run dev     # with nodemon (auto-restart)
   # or
   npm start       # plain node
```

6. Open the app at [http://localhost:5000](http://localhost:5000)

---

## Environment Variables

Create a `.env` file with the following keys:

```env
# --- Server ---
PORT=5000

# --- Database (required) ---
MONGO_URI=mongodb://localhost:27017/techkart

# --- Auth (required) ---
JWT_SECRET=your_jwt_secret_here

# --- Email (optional — registration works without it) ---
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# --- Cloudinary (optional — only needed for image file uploads) ---
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# --- Razorpay (optional — only needed for online payment) ---
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

---

## Default Admin Login

After running `npm run seed`, log in at `/admin/login` with:

- **Email:** `admin@shopfusion.com`
- **Password:** `password123`

---

## API Routes

| Method | Endpoint                    | Description                     | Access        |
|--------|------------------------------|----------------------------------|---------------|
| POST   | `/api/auth/register`         | Register a new user             | Public        |
| POST   | `/api/auth/login`            | Login                           | Public        |
| GET    | `/api/products`              | Get all products                | Public        |
| GET    | `/api/products/:id`          | Get single product              | Public        |
| POST   | `/api/products`              | Create a product                | Admin         |
| PUT    | `/api/products/:id`          | Update a product                | Admin         |
| DELETE | `/api/products/:id`          | Delete a product                | Admin         |
| GET    | `/api/cart`                  | Get logged-in user's cart        | User          |
| POST   | `/api/cart`                  | Add item to cart                | User          |
| PUT    | `/api/cart/:productId`       | Update cart item quantity       | User          |
| DELETE | `/api/cart/:productId`       | Remove item from cart           | User          |
| DELETE | `/api/cart`                  | Clear cart                      | User          |
| POST   | `/api/orders`                | Place an order                  | User          |
| GET    | `/api/orders/myOrders`       | Get logged-in user's orders     | User          |
| GET    | `/api/orders`                | Get all orders                  | Admin         |
| PUT    | `/api/orders/:id/status`     | Update order status             | Admin         |
| POST   | `/api/payment/order`         | Create Razorpay order           | Public        |
| POST   | `/api/payment/verify`        | Verify Razorpay payment         | Public        |
| GET    | `/api/admin/dashboard`       | Dashboard stats                 | Admin         |
| GET    | `/api/admin/customers`       | List all customers              | Admin         |
| GET    | `/api/admin/orders`          | List all orders                 | Admin         |
| PUT    | `/api/admin/orders/:id`      | Update order status             | Admin         |

---

## Available Scripts

| Command         | Description                              |
|-----------------|-------------------------------------------|
| `npm start`     | Runs the server with plain Node           |
| `npm run dev`   | Runs the server with nodemon (dev mode)   |
| `npm run seed`  | Seeds the database with admin + products  |

---

## License

This project is for educational purposes.