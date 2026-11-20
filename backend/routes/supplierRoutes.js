const express = require('express');
const router = express.Router();

const supplierController = require('../controllers/supplierController');

// Get all suppliers
router.get('/', supplierController.getAllSuppliers);

// Add a supplier
router.post('/', supplierController.createSupplier);

// Update a supplier
router.put('/:id', supplierController.updateSupplier);

// Delete a supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;