
const { db } = require('../config/db');

// Get all sales
async function getAllSales() {
    const [rows] = await db.query(`
        SELECT
            sales.sale_id,
            vendors.vendor_name,
            sales.sale_date,
            sales.total_amount,
            sales.payment_method,
            sales.amount_paid,
            sales.payment_status,
            (sales.total_amount - sales.amount_paid)
                AS outstanding_balance
        FROM sales
        JOIN vendors
        ON sales.vendor_id = vendors.vendor_id
        ORDER BY sales.sale_id DESC
    `);

    return rows;
}

// Create a sale
async function createSale(vendor_id, items, payment_method, amount_paid) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let total_amount = 0;

        // Check stock and calculate total
        for (const item of items) {
            const [stockRows] = await connection.query(
                `SELECT available_quantity
                 FROM stock
                 WHERE fruit_id = ?
                 AND packaging_size = ?
                 FOR UPDATE`,
                [item.fruit_id, item.packaging_size]
            );

            if (stockRows.length === 0) {
                throw new Error(
                    `No stock record found for fruit ID ${item.fruit_id} (${item.packaging_size})`
                );
            }

            if (stockRows[0].available_quantity < item.quantity) {
                throw new Error(
                    `Insufficient stock for fruit ID ${item.fruit_id} (${item.packaging_size}). Available: ${stockRows[0].available_quantity}, requested: ${item.quantity}`
                );
            }

            total_amount += item.quantity * item.unit_price;
        }

        // Validate payment amount
        if (amount_paid > total_amount) {
            throw new Error('Amount paid cannot be greater than total amount');
        }

        // Calculate payment status automatically
        let payment_status = 'UNPAID';

        if (amount_paid >= total_amount) {
            payment_status = 'PAID';
        } else if (amount_paid > 0) {
            payment_status = 'PARTIALLY_PAID';
        }

        // Save sale
        const [saleResult] = await connection.query(
            `INSERT INTO sales
            (vendor_id, sale_date, total_amount, payment_status,
             payment_method, amount_paid)
            VALUES (?, CURDATE(), ?, ?, ?, ?)`,
            [
                vendor_id,
                total_amount,
                payment_status,
                payment_method,
                amount_paid
            ]
        );

        const sale_id = saleResult.insertId;

        // Save sale details and reduce stock
        for (const item of items) {
            await connection.query(
                `INSERT INTO sales_details
                (sale_id, fruit_id, packaging_size, quantity, unit_price)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    sale_id,
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity,
                    item.unit_price
                ]
            );

            await connection.query(
                `UPDATE stock
                 SET available_quantity = available_quantity - ?
                 WHERE fruit_id = ?
                 AND packaging_size = ?`,
                [
                    item.quantity,
                    item.fruit_id,
                    item.packaging_size
                ]
            );
        }

        await connection.commit();

        return {
            sale_id,
            total_amount,
            amount_paid,
            outstanding_balance: total_amount - amount_paid,
            payment_status,
            payment_method
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

// Record an additional payment for an existing sale
async function addPayment(sale_id, payment_amount, payment_method) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT total_amount, amount_paid
             FROM sales
             WHERE sale_id = ?
             FOR UPDATE`,
            [sale_id]
        );

        if (rows.length === 0) {
            throw new Error('Sale not found');
        }

        const total_amount = Number(rows[0].total_amount);
        const current_paid = Number(rows[0].amount_paid);
        const new_paid = current_paid + payment_amount;

        if (new_paid > total_amount) {
            throw new Error('Payment exceeds the outstanding balance');
        }

        let payment_status = 'UNPAID';

        if (new_paid >= total_amount) {
            payment_status = 'PAID';
        } else if (new_paid > 0) {
            payment_status = 'PARTIALLY_PAID';
        }

        await connection.query(
            `UPDATE sales
             SET amount_paid = ?,
                 payment_method = ?,
                 payment_status = ?
             WHERE sale_id = ?`,
            [new_paid, payment_method, payment_status, sale_id]
        );

        await connection.commit();

        return {
            sale_id,
            total_amount,
            amount_paid: new_paid,
            outstanding_balance: total_amount - new_paid,
            payment_status,
            payment_method
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

module.exports = {
    getAllSales,
    createSale,
    addPayment
};
