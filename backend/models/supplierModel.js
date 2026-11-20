const { db } = require('../config/db');

// Get all suppliers
async function getAllSuppliers() {
    const [rows] = await db.query(`
        SELECT *
        FROM suppliers
        ORDER BY supplier_id DESC
    `);

    return rows;
}

// Get one supplier
async function getSupplierById(id) {
    const [rows] = await db.query(
        'SELECT * FROM suppliers WHERE supplier_id = ?',
        [id]
    );

    return rows[0];
}

// Add a supplier
async function createSupplier(supplier) {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = supplier;

    const [result] = await db.query(
        `INSERT INTO suppliers
        (business_name, contact_person, phone, province, address)
        VALUES (?, ?, ?, ?, ?)`,
        [business_name, contact_person, phone, province, address]
    );

    return result.insertId;
}

// Update a supplier
async function updateSupplier(id, supplier) {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = supplier;

    const [result] = await db.query(
        `UPDATE suppliers
         SET business_name = ?,
             contact_person = ?,
             phone = ?,
             province = ?,
             address = ?
         WHERE supplier_id = ?`,
        [business_name, contact_person, phone, province, address, id]
    );

    return result.affectedRows;
}

// Delete a supplier
async function deleteSupplier(id) {
    const [result] = await db.query(
        'DELETE FROM suppliers WHERE supplier_id = ?',
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};