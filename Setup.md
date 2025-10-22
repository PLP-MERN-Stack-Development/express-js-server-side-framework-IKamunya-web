# Express.js RESTful API

## Overview
This project implements a RESTful API for managing products using Express.js.

## Setup
1. Install dependencies:
   ```bash
   npm install
    ```
### Run the server:
```bash
npm start
```

## Endpoints
```bash
Method	Endpoint	Description
GET	/api/products	List products (filter, search, pagination)
GET	/api/products/:id	Get product by ID
POST	/api/products	Create product (requires API key)
PUT	/api/products/:id	Update product (requires API key)
DELETE	/api/products/:id	Delete product (requires API key)
GET	/api/products/stats	Product statistics
```