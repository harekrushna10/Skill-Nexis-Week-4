# Skill Nexis Week 4 — ShopSphere E-Commerce

A full-stack e-commerce starter project built with React, Node.js, Express, and MongoDB. It includes a polished storefront, user authentication, shopping cart, checkout, order history, and an admin dashboard.

## Features

### Customer storefront
- Responsive product catalogue with search and category filters
- Product cards with price, category, and stock availability
- Shopping cart with quantity controls and subtotal
- Registration and login using JWT authentication
- Checkout with shipping details and Cash on Delivery
- Order history for signed-in customers

### Admin dashboard
- Admin-only dashboard and protected API routes
- Create and delete products
- View all customer orders
- Update order status

### Security and engineering
- Password hashing with bcrypt
- JWT-protected routes and role-based authorization
- Server-side price lookup during checkout (client prices are not trusted)
- User-scoped order history
- Environment variables and `.gitignore`

## Tech stack
- Frontend: React, Vite, Axios, plain CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JSON Web Tokens and bcrypt

## Project structure

```text
Skill Nexis Week 4/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements
- Node.js 18 or later
- npm
- MongoDB Atlas account or local MongoDB

## 1. Configure the backend

Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and update the values:

```env
PORT=5003
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/shopsphere?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Seed an administrator account and starter products:

```bash
npm run seed
```

The seed script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env` if provided. Otherwise it creates `admin@shopsphere.local` with password `Admin@12345`. **Change the default password immediately** after your first login, and do not use the default credentials in a public deployment.

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5003`.

## 2. Configure the frontend

Open a second terminal in `frontend`:

```bash
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5003/api
```

Start React:

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.



Run `npm run seed` again after changing the admin values in `.env` to update the seeded admin account. Never commit `.env`.

## Main API routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/products` | Public | List/search/filter products |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | Admin | Create product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders/my` | Customer | My order history |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

## Notes
- This project uses Cash on Delivery as a working demo checkout flow. It does not collect card details or integrate a payment gateway.
- Product images use remote Unsplash image URLs. An internet connection is needed to display them.
- For production, add email verification, password reset, rate limiting, payment gateway integration, image storage, audit logging, and deployment-specific security settings.

## Author
**Harekrushna Behera**  
Skill Nexis Week 4 — Major Project
