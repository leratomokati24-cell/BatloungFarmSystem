
const { db } = require('../config/db');

// Get all purchases
async function getAllPurchases() {
    const [rows] = await db.query(`
        SELECT
            purchases.purchase_id,
            suppliers.business_name,
            purchases.purchase_date,
            purchases.total_amount
        FROM purchases
        JOIN suppliers
        ON purchases.supplier_id = suppliers.supplier_id
        ORDER BY purchases.purchase_id DESC
    `);

    return rows;
}

// Create a purchase and increase stock
async function createPurchase(supplier_id, items) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let total_amount = 0;

        for (const item of items) {
            total_amount += item.quantity * item.unit_cost;
        }

        // Save the purchase
        const [purchaseResult] = await connection.query(
            `INSERT INTO purchases
            (supplier_id, purchase_date, total_amount)
            VALUES (?, CURDATE(), ?)`,
            [supplier_id, total_amount]
        );

        const purchase_id = purchaseResult.insertId;

        // Save purchase details and update stock
        for (const item of items) {
            await connection.query(
                `INSERT INTO purchase_details
                (purchase_id, fruit_id, quantity, unit_cost, packaging_size)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    purchase_id,
                    item.fruit_id,
                    item.quantity,
                    item.unit_cost,
                    item.packaging_size
                ]
            );

            await connection.query(
                `INSERT INTO stock
                (fruit_id, packaging_size, available_quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                available_quantity =
                available_quantity + VALUES(available_quantity)`,
                [
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity
                ]
            );
        }

        await connection.commit();

        return {
            purchase_id,
            total_amount
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

module.exports = {
    getAllPurchases,
    createPurchase
};
