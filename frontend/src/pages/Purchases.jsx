
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fruits, setFruits] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([
    {
      fruit_id: "",
      quantity: "",
      packaging_size: "Small",
      unit_cost: ""
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPurchaseData();
  }, []);

  async function loadPurchaseData() {
    try {
      setLoading(true);
      setError("");

      const [purchaseResponse, supplierResponse, fruitResponse] =
        await Promise.all([
          fetch(`${API}/purchases`),
          fetch(`${API}/suppliers`),
          fetch(`${API}/fruits`)
        ]);

      const purchaseData = await purchaseResponse.json();
      const supplierData = await supplierResponse.json();
      const fruitData = await fruitResponse.json();

      if (!purchaseResponse.ok) {
        throw new Error("Could not load purchase records.");
      }

      if (!supplierResponse.ok) {
        throw new Error("Could not load suppliers.");
      }

      if (!fruitResponse.ok) {
        throw new Error("Could not load fruits.");
      }

      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
      setFruits(Array.isArray(fruitData) ? fruitData : []);
    } catch (err) {
      console.error("Purchase loading error:", err);
      setError(err.message || "Unable to load purchase information.");
    } finally {
      setLoading(false);
    }
  }

  function handleItemChange(index, field, value) {
    setItems(currentItems =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function addItem() {
    setItems(currentItems => [
      ...currentItems,
      {
        fruit_id: "",
        quantity: "",
        packaging_size: "Small",
        unit_cost: ""
      }
    ]);
  }

  function removeItem(index) {
    setItems(currentItems =>
      currentItems.filter((item, itemIndex) => itemIndex !== index)
    );
  }

  const totalAmount = items.reduce((total, item) => {
    return (
      total +
      Number(item.quantity || 0) * Number(item.unit_cost || 0)
    );
  }, 0);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one fruit.");
      return;
    }

    for (const item of items) {
      if (
        !item.fruit_id ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        item.unit_cost === "" ||
        !Number.isFinite(Number(item.unit_cost)) ||
        Number(item.unit_cost) < 0
      ) {
        setError(
          "Please select a fruit and enter a valid quantity and unit cost for every item."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(`${API}/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          supplier_id: Number(supplierId),
          items: items.map(item => ({
            fruit_id: Number(item.fruit_id),
            quantity: Number(item.quantity),
            packaging_size: item.packaging_size,
            unit_cost: Number(item.unit_cost)
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save the purchase.");
      }

      setMessage(
        `Purchase saved successfully. Purchase ID: ${data.purchase_id}. Total: M ${Number(
          data.total_amount
        ).toFixed(2)}`
      );

      setSupplierId("");
      setItems([
        {
          fruit_id: "",
          quantity: "",
          packaging_size: "Small",
          unit_cost: ""
        }
      ]);

      await loadPurchaseData();
    } catch (err) {
      console.error("Purchase saving error:", err);
      setError(err.message || "Could not save the purchase.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function formatMoney(amount) {
    return `M ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  const filteredPurchases = purchases.filter(purchase =>
    String(purchase.business_name || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    String(purchase.purchase_id || "").includes(search)
  );

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h2>Purchase Management</h2>
          <p>Record fruit purchases from your suppliers.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Purchases</span>
          <h3>{purchases.length}</h3>
          <p>Recorded transactions</p>
        </div>

        <div className="summary-card">
          <span>Total Purchase Amount</span>
          <h3>
            {formatMoney(
              purchases.reduce(
                (total, purchase) =>
                  total + Number(purchase.total_amount || 0),
                0
              )
            )}
          </h3>
          <p>Value of recorded purchases</p>
        </div>

        <div className="summary-card">
          <span>Suppliers</span>
          <h3>{suppliers.length}</h3>
          <p>Registered suppliers</p>
        </div>
      </div>

      {message && (
        <div className="success-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h3>Record New Purchase</h3>
            <p>Select a supplier and enter the fruits received.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="purchaseSupplier">Supplier</label>
            <select
              id="purchaseSupplier"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option
                  key={supplier.supplier_id}
                  value={supplier.supplier_id}
                >
                  {supplier.business_name}
                </option>
              ))}
            </select>
          </div>

          <div className="section-heading purchase-items-heading">
            <div>
              <h3>Purchase Items</h3>
              <p>Add one or more fruit items to this purchase.</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={addItem}
            >
              Add Another Item
            </button>
          </div>

          {items.map((item, index) => (
            <div className="purchase-item-row" key={index}>
              <div className="form-field">
                <label>Fruit</label>
                <select
                  value={item.fruit_id}
                  onChange={e =>
                    handleItemChange(index, "fruit_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select fruit</option>
                  {fruits.map(fruit => (
                    <option key={fruit.fruit_id} value={fruit.fruit_id}>
                      {fruit.fruit_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Quantity (boxes)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={e =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-field">
                <label>Packaging Size</label>
                <select
                  value={item.packaging_size}
                  onChange={e =>
                    handleItemChange(index, "packaging_size", e.target.value)
                  }
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div className="form-field">
                <label>Unit Cost (M)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_cost}
                  onChange={e =>
                    handleItemChange(index, "unit_cost", e.target.value)
                  }
                  placeholder="Enter unit cost"
                  required
                />
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div className="purchase-total">
            <span>Purchase Total</span>
            <strong>{formatMoney(totalAmount)}</strong>
          </div>

          <div className="supplier-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving Purchase..." : "Save Purchase"}
            </button>
          </div>
        </form>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h3>Purchase Records</h3>
            <p>All purchases recorded in the system.</p>
          </div>

          <input
            type="search"
            placeholder="Search supplier or purchase ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading purchase records...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Purchase ID</th>
                  <th>Supplier</th>
                  <th>Purchase Date</th>
                  <th>Total Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="4">No purchase records found.</td>
                  </tr>
                ) : (
                  filteredPurchases.map(purchase => (
                    <tr key={purchase.purchase_id}>
                      <td>
                        PUR-{String(purchase.purchase_id).padStart(3, "0")}
                      </td>
                      <td>{purchase.business_name || "N/A"}</td>
                      <td>{formatDate(purchase.purchase_date)}</td>
                      <td>{formatMoney(purchase.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Purchases;
