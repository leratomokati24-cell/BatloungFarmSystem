
const { db } = require('../config/db');

// Get all vendors
async function getAllVendors() {
    const [rows] = await db.query(
        'SELECT * FROM vendors ORDER BY vendor_id DESC'
    );

    return rows;
}

// Get one vendor
async function getVendorById(id) {
    const [rows] = await db.query(
        'SELECT * FROM vendors WHERE vendor_id = ?',
        [id]
    );

    return rows[0];
}

// Add a vendor
async function addVendor(vendor_name, phone_number, location) {
    const [result] = await db.query(
        `INSERT INTO vendors
        (vendor_name, phone_number, location, registration_date)
        VALUES (?, ?, ?, CURDATE())`,
        [vendor_name, phone_number, location]
    );

    return result;
}

// Update a vendor
async function updateVendor(id, vendor_name, phone_number, location) {
    const [result] = await db.query(
        `UPDATE vendors
         SET vendor_name = ?, phone_number = ?, location = ?
         WHERE vendor_id = ?`,
        [vendor_name, phone_number, location, id]
    );

    return result;
}

// Delete a vendor
async function deleteVendor(id) {
    const [result] = await db.query(
        'DELETE FROM vendors WHERE vendor_id = ?',
        [id]
    );

    return result;
}

module.exports = {
    getAllVendors,
    getVendorById,
    addVendor,
    updateVendor,
    deleteVendor
};
