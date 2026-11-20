
import { useEffect, useState } from "react";

const API = "https://batloungfarmsystem-production.up.railway.app/api";

const emptyItem = {
    fruit_id: "",
    quantity: 1,
    unit_price: "",
    packaging_size: "Small"
};

function Sales() {
    const [sales, setSales] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [fruits, setFruits] = useState([]);
    const [items, setItems] = useState([{ ...emptyItem }]);

    const [vendorId, setVendorId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [amountPaid, setAmountPaid] = useState("");

    const [selectedSale, setSelectedSale] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [additionalPaymentMethod, setAdditionalPaymentMethod] =
        useState("CASH");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [salesResponse, vendorsResponse, fruitsResponse] =
                await Promise.all([
                    fetch(`${API}/sales`),
                    fetch(`${API}/vendors`),
                    fetch(`${API}/fruits`)
                ]);

            if (!salesResponse.ok || !vendorsResponse.ok || !fruitsResponse.ok) {
                throw new Error("Failed to load sales information.");
            }

            const salesData = await salesResponse.json();
            const vendorsData = await vendorsResponse.json();
            const fruitsData = await fruitsResponse.json();

            setSales(Array.isArray(salesData) ? salesData : []);
            setVendors(Array.isArray(vendorsData) ? vendorsData : []);
            setFruits(Array.isArray(fruitsData) ? fruitsData : []);
        } catch (err) {
            setError(err.message || "Could not load sales information.");
        }
    }

    function updateItem(index, field, value) {
        const updatedItems = [...items];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        setItems(updatedItems);
    }

    function addItem() {
        setItems([...items, { ...emptyItem }]);
    }

    function removeItem(index) {
        if (items.length === 1) {
            setError("A sale must contain at least one fruit.");
            return;
        }

        setItems(items.filter((_, itemIndex) => itemIndex !== index));
        setError("");
    }

    const totalAmount = items.reduce((total, item) => {
        return total +
            (Number(item.quantity) || 0) *
            (Number(item.unit_price) || 0);
    }, 0);

    async function createSale(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!vendorId) {
            setError("Please select a vendor.");
            return;
        }

        const validItems = items.every(item =>
            item.fruit_id &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0 &&
            item.unit_price !== "" &&
            Number(item.unit_price) >= 0 &&
            ["Small", "Medium", "Large"].includes(item.packaging_size)
        );

        if (!validItems) {
            setError("Please complete all fruit details correctly.");
            return;
        }

        const paid = amountPaid === "" ? 0 : Number(amountPaid);

        if (!Number.isFinite(paid) || paid < 0 || paid > totalAmount) {
            setError("Amount paid must be between zero and the sale total.");
            return;
        }

        if (paymentMethod !== "CREDIT" && paid <= 0) {
            setError("Enter an amount paid for Cash or Mobile Money.");
            return;
        }

        if (paymentMethod === "CREDIT" && paid !== 0) {
            setError("For a credit sale, enter zero as the amount paid.");
            return;
        }

        const saleData = {
            vendor_id: Number(vendorId),
            payment_method: paymentMethod,
            amount_paid: paid,
            items: items.map(item => ({
                fruit_id: Number(item.fruit_id),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                packaging_size: item.packaging_size
            }))
        };

        try {
            setLoading(true);

            const response = await fetch(`${API}/sales`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(saleData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create sale.");
            }

            setMessage(
                `Sale created successfully. Sale ID: ${result.sale_id}. Total: M${Number(result.total_amount).toFixed(2)}`
            );

            setVendorId("");
            setItems([{ ...emptyItem }]);
            setPaymentMethod("CASH");
            setAmountPaid("");

            await loadData();
        } catch (err) {
            setError(err.message || "Could not create sale.");
        } finally {
            setLoading(false);
        }
    }

    async function recordPayment(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!selectedSale) {
            setError("Please select a sale.");
            return;
        }

        const amount = Number(paymentAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Enter a valid payment amount.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API}/sales/${selectedSale}/payment`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        payment_amount: amount,
                        payment_method: additionalPaymentMethod
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to record payment.");
            }

            setMessage(
                `Payment recorded successfully. Remaining balance: M${Number(result.outstanding_balance).toFixed(2)}`
            );

            setSelectedSale("");
            setPaymentAmount("");

            await loadData();
        } catch (err) {
            setError(err.message || "Could not record payment.");
        } finally {
            setLoading(false);
        }
    }

    function formatMoney(value) {
        return `M${Number(value || 0).toFixed(2)}`;
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString();
    }

    const outstandingSales = sales.filter(sale =>
        Number(sale.outstanding_balance) > 0
    );

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <h1>Sales Management</h1>
                    <p>Record fruit sales and manage vendor payments.</p>
                </div>
            </div>

            {message && (
                <div className="success-message">{message}</div>
            )}

            {error && (
                <div className="error-message">{error}</div>
            )}

            <div className="summary-grid">
                <div className="summary-card">
                    <h3>Total Sales</h3>
                    <p>{sales.length}</p>
                </div>

                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p>
                        {formatMoney(
                            sales.reduce(
                                (total, sale) =>
                                    total + Number(sale.total_amount || 0),
                                0
                            )
                        )}
                    </p>
                </div>

                <div className="summary-card">
                    <h3>Outstanding Balance</h3>
                    <p>
                        {formatMoney(
                            sales.reduce(
                                (total, sale) =>
                                    total + Number(sale.outstanding_balance || 0),
                                0
                            )
                        )}
                    </p>
                </div>

                <div className="summary-card">
                    <h3>Unpaid Sales</h3>
                    <p>{outstandingSales.length}</p>
                </div>
            </div>

            <div className="content-card">
                <div className="section-heading">
                    <h2>Record New Sale</h2>
                </div>

                <form onSubmit={createSale}>
                    <div className="sales-form-grid">
                        <div className="form-field">
                            <label>Select Vendor</label>
                            <select
                                value={vendorId}
                                onChange={e => setVendorId(e.target.value)}
                                required
                            >
                                <option value="">Choose vendor</option>
                                {vendors.map(vendor => (
                                    <option
                                        key={vendor.vendor_id}
                                        value={vendor.vendor_id}
                                    >
                                        {vendor.vendor_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={e => {
                                    setPaymentMethod(e.target.value);
                                    if (e.target.value === "CREDIT") {
                                        setAmountPaid("0");
                                    } else if (amountPaid === "0") {
                                        setAmountPaid("");
                                    }
                                }}
                            >
                                <option value="CASH">Cash</option>
                                <option value="MOBILE_MONEY">Mobile Money</option>
                                <option value="CREDIT">Credit</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Amount Paid (M)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                max={totalAmount}
                                value={amountPaid}
                                onChange={e => setAmountPaid(e.target.value)}
                                disabled={paymentMethod === "CREDIT"}
                                placeholder="Enter amount paid"
                            />
                        </div>
                    </div>

                    <h3 className="sales-items-heading">Sale Items</h3>

                    {items.map((item, index) => (
                        <div className="sales-item-row" key={index}>
                            <div className="form-field">
                                <label>Fruit</label>
                                <select
                                    value={item.fruit_id}
                                    onChange={e =>
                                        updateItem(index, "fruit_id", e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Choose fruit</option>
                                    {fruits.map(fruit => (
                                        <option
                                            key={fruit.fruit_id}
                                            value={fruit.fruit_id}
                                        >
                                            {fruit.fruit_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Packaging Size</label>
                                <select
                                    value={item.packaging_size}
                                    onChange={e =>
                                        updateItem(index, "packaging_size", e.target.value)
                                    }
                                >
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={item.quantity}
                                    onChange={e =>
                                        updateItem(index, "quantity", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Unit Price (M)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={e =>
                                        updateItem(index, "unit_price", e.target.value)
                                    }
                                    placeholder="Selling price"
                                    required
                                />
                            </div>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={() => removeItem(index)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={addItem}
                    >
                        Add Another Fruit
                    </button>

                    <div className="sales-total">
                        <span>Total Sale Amount</span>
                        <strong>{formatMoney(totalAmount)}</strong>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Save Sale"}
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="section-heading">
                    <h2>Record Additional Payment</h2>
                </div>

                <form onSubmit={recordPayment}>
                    <div className="sales-form-grid">
                        <div className="form-field">
                            <label>Select Outstanding Sale</label>
                            <select
                                value={selectedSale}
                                onChange={e => setSelectedSale(e.target.value)}
                                required
                            >
                                <option value="">Choose sale</option>
                                {outstandingSales.map(sale => (
                                    <option
                                        key={sale.sale_id}
                                        value={sale.sale_id}
                                    >
                                        Sale #{sale.sale_id} - {sale.vendor_name} -
                                        Balance: {formatMoney(sale.outstanding_balance)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Payment Amount (M)</label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                                placeholder="Enter payment amount"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Payment Method</label>
                            <select
                                value={additionalPaymentMethod}
                                onChange={e =>
                                    setAdditionalPaymentMethod(e.target.value)
                                }
                            >
                                <option value="CASH">Cash</option>
                                <option value="MOBILE_MONEY">Mobile Money</option>
                                <option value="CREDIT">Credit</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        Record Payment
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="section-heading">
                    <h2>Sales Records</h2>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sale ID</th>
                                <th>Vendor</th>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Amount Paid</th>
                                <th>Balance</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sales.length > 0 ? (
                                sales.map(sale => (
                                    <tr key={sale.sale_id}>
                                        <td>#{sale.sale_id}</td>
                                        <td>{sale.vendor_name}</td>
                                        <td>{formatDate(sale.sale_date)}</td>
                                        <td>{formatMoney(sale.total_amount)}</td>
                                        <td>{formatMoney(sale.amount_paid)}</td>
                                        <td>
                                            {formatMoney(sale.outstanding_balance)}
                                        </td>
                                        <td>
                                            {(sale.payment_method || "").replaceAll("_", " ")}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${String(
                                                    sale.payment_status || ""
                                                ).toLowerCase()}`}
                                            >
                                                {sale.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">
                                        No sales records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Sales;

