
const { db } = require('../config/db');

// Get all stock
async function getAllStock() {
    const [rows] = await db.query(`
        SELECT
            stock.stock_id,
            fruits.fruit_name,
            stock.packaging_size,
            stock.available_quantity
        FROM stock
        JOIN fruits ON stock.fruit_id = fruits.fruit_id
        ORDER BY fruits.fruit_name, stock.packaging_size
    `);

    return rows;
}

// Add stock
async function addStock(fruit_id, packaging_size, quantity) {
    const [result] = await db.query(`
        INSERT INTO stock (fruit_id, packaging_size, available_quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        available_quantity = available_quantity + VALUES(available_quantity)
    `, [fruit_id, packaging_size, quantity]);

    return result;
}

module.exports = {
    getAllStock,
    addStock
};
