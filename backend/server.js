
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

// Import routes
const fruitRoutes = require('./routes/fruitRoutes');
const stockRoutes = require('./routes/stockRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const stockManagementRoutes = require('./routes/stockManagementRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.send('Batloung Farm Distribution System API is running!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/fruits', fruitRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/stock-management', stockManagementRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    testConnection();
});
