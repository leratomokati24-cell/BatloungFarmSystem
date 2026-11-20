
const vendorModel = require('../models/vendorModel');

// Get all vendors
async function getVendors(req, res) {
    try {
        const vendors = await vendorModel.getAllVendors();

        res.status(200).json(vendors);

    } catch (error) {
        console.error('Get vendors error:', error);

        res.status(500).json({
            message: 'Failed to get vendors'
        });
    }
}

// Add a new vendor
async function createVendor(req, res) {
    try {
        const { vendor_name, phone_number, location } = req.body;

        if (!vendor_name || !phone_number || !location) {
            return res.status(400).json({
                message: 'Please provide vendor name, phone number and location.'
            });
        }

        const result = await vendorModel.addVendor(
            vendor_name,
            phone_number,
            location
        );

        res.status(201).json({
            message: 'Vendor added successfully',
            vendor_id: result.insertId
        });

    } catch (error) {
        console.error('Add vendor error:', error);

        res.status(500).json({
            message: 'Failed to add vendor'
        });
    }
}

// Update a vendor
async function updateVendor(req, res) {
    try {
        const { id } = req.params;
        const { vendor_name, phone_number, location } = req.body;

        if (!vendor_name || !phone_number || !location) {
            return res.status(400).json({
                message: 'Please provide all vendor details.'
            });
        }

        const existingVendor = await vendorModel.getVendorById(id);

        if (!existingVendor) {
            return res.status(404).json({
                message: 'Vendor not found.'
            });
        }

        await vendorModel.updateVendor(
            id,
            vendor_name,
            phone_number,
            location
        );

        res.status(200).json({
            message: 'Vendor updated successfully.'
        });

    } catch (error) {
        console.error('Update vendor error:', error);

        res.status(500).json({
            message: 'Failed to update vendor.'
        });
    }
}

// Delete a vendor
async function deleteVendor(req, res) {
    try {
        const { id } = req.params;

        const existingVendor = await vendorModel.getVendorById(id);

        if (!existingVendor) {
            return res.status(404).json({
                message: 'Vendor not found.'
            });
        }

        await vendorModel.deleteVendor(id);

        res.status(200).json({
            message: 'Vendor deleted successfully.'
        });

    } catch (error) {
        console.error('Delete vendor error:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message: 'This vendor cannot be deleted because they have existing sales records.'
            });
        }

        res.status(500).json({
            message: 'Failed to delete vendor.'
        });
    }
}

module.exports = {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor
};
