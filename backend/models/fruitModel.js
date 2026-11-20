
const { db } = require('../config/db');

// Get all fruits
async function getAllFruits() {
    const [rows] = await db.query(`
        SELECT fruit_id, fruit_name, description, status
        FROM fruits
        ORDER BY fruit_id DESC
    `);

    return rows;
}

// Add a new fruit
async function addFruit(fruit_name, description) {
    const [result] = await db.query(
        `INSERT INTO fruits (fruit_name, description)
         VALUES (?, ?)`,
        [fruit_name, description || null]
    );

    return result;
}

// Update fruit details
async function updateFruit(fruit_id, fruit_name, description) {
    const [result] = await db.query(
        `UPDATE fruits
         SET fruit_name = ?, description = ?
         WHERE fruit_id = ?`,
        [fruit_name, description || null, fruit_id]
    );

    return result;
}

// Activate or deactivate a fruit
async function updateFruitStatus(fruit_id, status) {
    const [result] = await db.query(
        `UPDATE fruits
         SET status = ?
         WHERE fruit_id = ?`,
        [status, fruit_id]
    );

    return result;
}

// Delete a fruit
async function deleteFruit(fruit_id) {
    const [result] = await db.query(
        `DELETE FROM fruits
         WHERE fruit_id = ?`,
        [fruit_id]
    );

    return result;
}

module.exports = {
    getAllFruits,
    addFruit,
    updateFruit,
    updateFruitStatus,
    deleteFruit
};
