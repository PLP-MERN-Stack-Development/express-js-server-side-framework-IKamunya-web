// server.js - Express.js RESTful API Assignment
// ---------------------------------------------
// Description: A complete Express.js RESTful API for managing products
// Features: CRUD, middleware, error handling, filtering, pagination, search, and statistics

// ===== Import Modules =====
import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// ===== Initialize App =====
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware Setup =====
app.use(bodyParser.json());

// Logger Middleware - Logs method, URL, and timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication Middleware - Checks for API key
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'mysecretapikey') {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key' });
  }
  next();
};

// ===== In-Memory Product Database =====
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false,
  },
];

// ===== Routes =====

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Visit /api/products to view products.');
});

// GET /api/products - List products (with filter, search, pagination)
app.get('/api/products', (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  // Filter by category
  let filteredProducts = products;
  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Search by name
  if (search) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    totalProducts: filteredProducts.length,
    currentPage: parseInt(page),
    totalPages: Math.ceil(filteredProducts.length / limit),
    products: paginatedProducts,
  });
});

// GET /api/products/:id - Get specific product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/products - Create product (Protected)
app.post('/api/products', authenticate, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || !price || !category || typeof inStock !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required and inStock must be boolean' });
  }

  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update product (Protected)
app.put('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, inStock } = req.body;

  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) return res.status(404).json({ message: 'Product not found' });

  products[productIndex] = {
    ...products[productIndex],
    name: name ?? products[productIndex].name,
    description: description ?? products[productIndex].description,
    price: price ?? products[productIndex].price,
    category: category ?? products[productIndex].category,
    inStock: inStock ?? products[productIndex].inStock,
  };

  res.json(products[productIndex]);
});

// DELETE /api/products/:id - Delete product (Protected)
app.delete('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) return res.status(404).json({ message: 'Product not found' });

  const deletedProduct = products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully', deletedProduct });
});

// GET /api/products/stats - Product statistics
app.get('/api/products/stats', (req, res) => {
  const stats = {};
  products.forEach((product) => {
    stats[product.category] = (stats[product.category] || 0) + 1;
  });

  res.json({ totalProducts: products.length, countByCategory: stats });
});

// ===== Global Error Handling Middleware =====
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
