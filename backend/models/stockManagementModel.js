const { db } = require('../config/db');

// Get all stock records with their fruit names
async function getAllStock() {
    const [rows] = await db.query(`
        SELECT
            s.stock_id,
            s.fruit_id,
            f.fruit_name,
            s.packaging_size,
            s.available_quantity
        FROM stock s
        INNER JOIN fruits f
            ON s.fruit_id = f.fruit_id
        ORDER BY
            f.fruit_name ASC,
            FIELD(
                s.packaging_size,
                'Small',
                'Medium',
                'Large'
            )
    `);

    return rows.map(row => ({
        ...row,
        available_quantity: Number(row.available_quantity)
    }));
}

module.exports = {
    getAllStock
};