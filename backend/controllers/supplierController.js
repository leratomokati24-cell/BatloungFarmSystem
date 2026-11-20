const supplierModel = require('../models/supplierModel');

// Get all suppliers
async function getAllSuppliers(req, res) {
    try {
        const suppliers = await supplierModel.getAllSuppliers();

        res.status(200).json(suppliers);
    } catch (error) {
        console.error('Error getting suppliers:', error);

        res.status(500).json({
            message: 'Failed to retrieve suppliers'
        });
    }
}

// Add a supplier
async function createSupplier(req, res) {
    try {
        const {
            business_name,
            contact_person,
            phone,
            province,
            address
        } = req.body;

        if (!business_name || !contact_person || !phone || !province || !address) {
            return res.status(400).json({
                message: 'Please fill in all supplier fields'
            });
        }

        const supplierId = await supplierModel.createSupplier({
            business_name,
            contact_person,
            phone,
            province,
            address
        });

        res.status(201).json({
            message: 'Supplier added successfully',
            supplier_id: supplierId
        });
    } catch (error) {
        console.error('Error adding supplier:', error);

        res.status(500).json({
            message: 'Failed to add supplier'
        });
    }
}

// Update a supplier
async function updateSupplier(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: 'Invalid supplier ID'
            });
        }

        const {
            business_name,
            contact_person,
            phone,
            province,
            address
        } = req.body;

        if (!business_name || !contact_person || !phone || !province || !address) {
            return res.status(400).json({
                message: 'Please fill in all supplier fields'
            });
        }

        const affectedRows = await supplierModel.updateSupplier(id, {
            business_name,
            contact_person,
            phone,
            province,
            address
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            message: 'Supplier updated successfully'
        });
    } catch (error) {
        console.error('Error updating supplier:', error);

        res.status(500).json({
            message: 'Failed to update supplier'
        });
    }
}

// Delete a supplier
async function deleteSupplier(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: 'Invalid supplier ID'
            });
        }

        const affectedRows = await supplierModel.deleteSupplier(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting supplier:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                message: 'This supplier cannot be deleted because it is linked to existing purchases.'
            });
        }

        res.status(500).json({
            message: 'Failed to delete supplier'
        });
    }
}

module.exports = {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
};