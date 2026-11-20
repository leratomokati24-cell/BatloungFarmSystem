
import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api/stock-management";
const LOW_STOCK_LIMIT = 10;

function Stock() {
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadStock() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to load stock information.");
            }

            const data = await response.json();

            setStock(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStock();
    }, []);

    // Group stock by fruit
    const groupedStock = useMemo(() => {
        const groups = {};

        stock.forEach(item => {
            const fruitName = item.fruit_name || "Unknown Fruit";

            if (!groups[fruitName]) {
                groups[fruitName] = {
                    fruit_name: fruitName,
                    Small: 0,
                    Medium: 0,
                    Large: 0
                };
            }

            const size = item.packaging_size;

            if (["Small", "Medium", "Large"].includes(size)) {
                groups[fruitName][size] =
                    Number(item.available_quantity || 0);
            }
        });

        return Object.values(groups);
    }, [stock]);

    // Search fruits
    const filteredStock = groupedStock.filter(item =>
        item.fruit_name
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    // Total boxes
    const totalBoxes = stock.reduce(
        (total, item) =>
            total + Number(item.available_quantity || 0),
        0
    );

    // Low stock records
    const lowStockItems = stock.filter(
        item => Number(item.available_quantity) <= LOW_STOCK_LIMIT
    );

    return (
        <div className="page-container stock-page">

            <div className="page-heading">
                <div>
                    <h1>Stock Management</h1>
                    <p>
                        Monitor fruit stock across Small, Medium and Large packaging.
                    </p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={loadStock}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh Stock"}
                </button>
            </div>

            <div className="summary-grid">
                <div className="summary-card">
                    <p>Fruit Types</p>
                    <h2>{groupedStock.length}</h2>
                </div>

                <div className="summary-card">
                    <p>Total Available Boxes</p>
                    <h2>{totalBoxes}</h2>
                </div>

                <div className="summary-card">
                    <p>Low Stock Records</p>
                    <h2>{lowStockItems.length}</h2>
                </div>
            </div>

            {lowStockItems.length > 0 && (
                <div className="stock-warning">
                    <strong>Low Stock Notice</strong>
                    <p>
                        {lowStockItems.length} packaging record(s) have
                        10 boxes or fewer available.
                    </p>
                </div>
            )}

            <div className="content-card stock-records-card">

                <div className="section-heading">
                    <div>
                        <h2>Available Fruit Stock</h2>
                        <p>
                            Each fruit is displayed with all its packaging sizes.
                        </p>
                    </div>
                </div>

                <div className="stock-search-row">
                    <input
                        type="text"
                        placeholder="Search fruit by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <span>
                        {filteredStock.length} fruit(s) found
                    </span>
                </div>

                {loading ? (
                    <p className="page-message">
                        Loading stock information...
                    </p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <div className="table-wrapper">

                        <table className="data-table stock-grouped-table">
                            <thead>
                                <tr>
                                    <th>Fruit Name</th>
                                    <th>Small</th>
                                    <th>Medium</th>
                                    <th>Large</th>
                                    <th>Total Boxes</th>
                                    <th>Stock Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStock.length > 0 ? (
                                    filteredStock.map(item => {
                                        const fruitTotal =
                                            item.Small +
                                            item.Medium +
                                            item.Large;

                                        const hasLowStock =
                                            [item.Small, item.Medium, item.Large]
                                                .some(quantity =>
                                                    quantity <= LOW_STOCK_LIMIT
                                                );

                                        return (
                                            <tr key={item.fruit_name}>
                                                <td className="stock-fruit-name">
                                                    {item.fruit_name}
                                                </td>

                                                <td>{item.Small}</td>
                                                <td>{item.Medium}</td>
                                                <td>{item.Large}</td>

                                                <td className="stock-total">
                                                    {fruitTotal}
                                                </td>

                                                <td>
                                                    <span className={
                                                        hasLowStock
                                                            ? "status-badge status-low"
                                                            : "status-badge status-good"
                                                    }>
                                                        {hasLowStock
                                                            ? "Low Stock"
                                                            : "Available"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table">
                                            No fruits found. Try another search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                )}
            </div>
        </div>
    );
}

export default Stock;
