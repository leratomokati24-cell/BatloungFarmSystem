
const { db } = require('../config/db');

// Dashboard statistics
async function getDashboardSummary() {
    const [sales] = await db.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total_sales
        FROM sales
    `);

    const [purchases] = await db.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total_purchases
        FROM purchases
    `);

    const [stock] = await db.query(`
        SELECT COALESCE(SUM(available_quantity), 0) AS total_stock
        FROM stock
    `);

    const [vendors] = await db.query(`
        SELECT COUNT(*) AS total_vendors
        FROM vendors
    `);

    return {
        totalSales: Number(sales[0].total_sales),
        totalPurchases: Number(purchases[0].total_purchases),
        totalStock: Number(stock[0].total_stock),
        totalVendors: Number(vendors[0].total_vendors)
    };
}

// Five most recent sales
async function getRecentSales() {
    const [rows] = await db.query(`
        SELECT
            sales.sale_id,
            vendors.vendor_name,
            sales.sale_date,
            sales.total_amount,
            sales.payment_status
        FROM sales
        JOIN vendors
        ON sales.vendor_id = vendors.vendor_id
        ORDER BY sales.sale_date DESC, sales.sale_id DESC
        LIMIT 5
    `);

    return rows;
}

// Actual sales for the current Monday-to-Sunday week
async function getWeeklySales() {
    const [rows] = await db.query(`
        SELECT
            DAYOFWEEK(sale_date) AS day_number,
            COALESCE(SUM(total_amount), 0) AS total_sales
        FROM sales
        WHERE sale_date >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
        AND sale_date < CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
            + INTERVAL 7 DAY
        GROUP BY DAYOFWEEK(sale_date)
    `);

    return rows.map(row => ({
        dayNumber: Number(row.day_number),
        sales: Number(row.total_sales)
    }));
}

// Actual Quick Summary information
async function getQuickSummary() {
    const [purchases] = await db.query(`
        SELECT COUNT(*) AS total_purchases
        FROM purchases
    `);

    const [sales] = await db.query(`
        SELECT COUNT(*) AS total_sales
        FROM sales
    `);

    const [payments] = await db.query(`
        SELECT
            COUNT(*) AS outstanding_transactions,
            COALESCE(
                SUM(GREATEST(total_amount - amount_paid, 0)),
                0
            ) AS outstanding_amount
        FROM sales
        WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    `);

    return {
        totalPurchases: Number(purchases[0].total_purchases),
        totalSales: Number(sales[0].total_sales),
        outstandingPayments: Number(payments[0].outstanding_transactions),
        outstandingAmount: Number(payments[0].outstanding_amount)
    };
}

// Report 1: Top five most purchased fruits
async function getTopFruits() {
    const [rows] = await db.query(`
        SELECT
            fruits.fruit_name,
            SUM(purchase_details.quantity) AS total_boxes
        FROM purchase_details
        JOIN fruits
        ON purchase_details.fruit_id = fruits.fruit_id
        GROUP BY fruits.fruit_id, fruits.fruit_name
        ORDER BY total_boxes DESC
        LIMIT 5
    `);

    return rows;
}

// Report 2: Revenue between two dates
async function getRevenue(start_date, end_date) {
    const [rows] = await db.query(`
        SELECT
            COUNT(sale_id) AS total_sales,
            COALESCE(SUM(total_amount), 0) AS total_revenue
        FROM sales
        WHERE sale_date BETWEEN ? AND ?
    `, [start_date, end_date]);

    return rows[0];
}

// Report 3: Vendor who purchased the most boxes
async function getTopVendor() {
    const [rows] = await db.query(`
        SELECT
            vendors.vendor_id,
            vendors.vendor_name,
            SUM(sales_details.quantity) AS total_boxes
        FROM sales_details
        JOIN sales
        ON sales_details.sale_id = sales.sale_id
        JOIN vendors
        ON sales.vendor_id = vendors.vendor_id
        GROUP BY vendors.vendor_id, vendors.vendor_name
        ORDER BY total_boxes DESC
        LIMIT 1
    `);

    return rows;
}

// Report 4: Stock by fruit and packaging size
async function getStockReport() {
    const [rows] = await db.query(`
        SELECT
            fruits.fruit_name,
            stock.packaging_size,
            stock.available_quantity
        FROM stock
        JOIN fruits
        ON stock.fruit_id = fruits.fruit_id
        ORDER BY fruits.fruit_name, stock.packaging_size
    `);

    return rows;
}

module.exports = {
    getDashboardSummary,
    getRecentSales,
    getWeeklySales,
    getQuickSummary,
    getTopFruits,
    getRevenue,
    getTopVendor,
    getStockReport
};
