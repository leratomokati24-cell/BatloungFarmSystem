
import { useEffect, useMemo, useState } from "react";

import "../styles/Pages.css";

const API = "http://localhost:5000/api";

function Payments() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);

  function money(amount) {
    return `M ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function getPaidAmount(sale) {
    return Number(sale.amount_paid || 0);
  }

  function getBalance(sale) {
    if (sale.outstanding_balance !== undefined &&
        sale.outstanding_balance !== null) {
      return Math.max(0, Number(sale.outstanding_balance));
    }

    return Math.max(
      0,
      Number(sale.total_amount || 0) - getPaidAmount(sale)
    );
  }

  function getStatus(sale) {
    const balance = getBalance(sale);

    if (balance <= 0) return "PAID";
    if (getPaidAmount(sale) > 0) return "PARTIALLY_PAID";

    return "UNPAID";
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

  async function fetchSales() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/sales`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load payment records.");
      }

      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payment loading error:", err);
      setError(err.message || "Unable to load payment records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSales();
  }, []);

  function openPaymentForm(sale) {
    setSelectedSale(sale);
    setPaymentAmount("");
    setPaymentMethod("CASH");
    setError("");
    setMessage("");
  }

  function closePaymentForm() {
    setSelectedSale(null);
    setPaymentAmount("");
    setPaymentMethod("CASH");
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault();

    if (!selectedSale) return;

    const amount = Number(paymentAmount);
    const balance = getBalance(selectedSale);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (amount > balance) {
      setError("The payment cannot be greater than the outstanding balance.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API}/sales/${selectedSale.sale_id}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            payment_amount: amount,
            payment_method: paymentMethod
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not record payment.");
      }

      closePaymentForm();
      setMessage(
        data.message || "Payment recorded successfully."
      );

      await fetchSales();
    } catch (err) {
      console.error("Payment recording error:", err);
      setError(err.message || "Could not record payment.");
    } finally {
      setSaving(false);
    }
  }

  const paymentSummary = useMemo(() => {
    const totalAmount = sales.reduce(
      (sum, sale) => sum + Number(sale.total_amount || 0),
      0
    );

    const totalPaid = sales.reduce(
      (sum, sale) => sum + getPaidAmount(sale),
      0
    );

    const outstanding = sales.reduce(
      (sum, sale) => sum + getBalance(sale),
      0
    );

    const unpaidCount = sales.filter(
      sale => getStatus(sale) === "UNPAID"
    ).length;

    const partialCount = sales.filter(
      sale => getStatus(sale) === "PARTIALLY_PAID"
    ).length;

    const paidCount = sales.filter(
      sale => getStatus(sale) === "PAID"
    ).length;

    return {
      totalAmount,
      totalPaid,
      outstanding,
      unpaidCount,
      partialCount,
      paidCount
    };
  }, [sales]);

  const filteredSales = sales.filter(sale => {
    const status = getStatus(sale);
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(sale.sale_id || "").includes(searchText) ||
      String(sale.vendor_name || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-content payments-page">
      <div className="page-heading">
        <div>
          <h2>Payments Management</h2>
          <p>
            View sales payments, outstanding balances, and record additional payments.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={fetchSales}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Payments"}
        </button>
      </div>

      <section className="payments-summary-grid">
        <div className="stat-card">
          <span>Total Sales Amount</span>
          <h3>{money(paymentSummary.totalAmount)}</h3>
          <span>Value of all sales</span>
        </div>

        <div className="stat-card">
          <span>Total Amount Paid</span>
          <h3>{money(paymentSummary.totalPaid)}</h3>
          <span>Payments received</span>
        </div>

        <div className="stat-card">
          <span>Outstanding Balance</span>
          <h3>{money(paymentSummary.outstanding)}</h3>
          <span>Amount still owed</span>
        </div>

        <div className="stat-card">
          <span>Unpaid Sales</span>
          <h3>{paymentSummary.unpaidCount}</h3>
          <span>Sales with no payment received</span>
        </div>
      </section>

      <section className="payments-status-summary">
        <div>
          <span>Paid Sales</span>
          <strong>{paymentSummary.paidCount}</strong>
        </div>

        <div>
          <span>Partially Paid Sales</span>
          <strong>{paymentSummary.partialCount}</strong>
        </div>

        <div>
          <span>Unpaid Sales</span>
          <strong>{paymentSummary.unpaidCount}</strong>
        </div>
      </section>

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

      {selectedSale && (
        <section className="content-card payment-form-card">
          <div className="card-heading">
            <div>
              <h3>Record Additional Payment</h3>
              <p>
                Sale SAL-{String(selectedSale.sale_id).padStart(3, "0")}
                {" - "}
                {selectedSale.vendor_name || "Vendor"}
              </p>
            </div>
          </div>

          <div className="payment-details-grid">
            <div>
              <span>Total Sale Amount</span>
              <strong>{money(selectedSale.total_amount)}</strong>
            </div>

            <div>
              <span>Already Paid</span>
              <strong>{money(getPaidAmount(selectedSale))}</strong>
            </div>

            <div>
              <span>Outstanding Balance</span>
              <strong>{money(getBalance(selectedSale))}</strong>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="payment-form">
            <div className="form-field">
              <label htmlFor="paymentAmount">Payment Amount (M)</label>
              <input
                id="paymentAmount"
                type="number"
                min="0.01"
                max={getBalance(selectedSale)}
                step="0.01"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="Enter amount received"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                required
              >
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>

            <div className="payment-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Recording..." : "Record Payment"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closePaymentForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-card payments-table-card">
        <div className="fruit-table-heading">
          <div>
            <h3>Sales Payment Records</h3>
            <p>Payment information for all recorded sales</p>
          </div>

          <div className="payments-filters">
            <input
              type="search"
              className="fruit-search"
              placeholder="Search sale or vendor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter payment status"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="table-message">Loading payment records...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => {
                    const status = getStatus(sale);
                    const balance = getBalance(sale);

                    return (
                      <tr key={sale.sale_id}>
                        <td>
                          SAL-{String(sale.sale_id).padStart(3, "0")}
                        </td>
                        <td>{sale.vendor_name || "N/A"}</td>
                        <td>{formatDate(sale.sale_date)}</td>
                        <td>{money(sale.total_amount)}</td>
                        <td>{money(getPaidAmount(sale))}</td>
                        <td className="payment-balance">
                          {money(balance)}
                        </td>
                        <td>
                          {sale.payment_method === "MOBILE_MONEY"
                            ? "Mobile Money"
                            : sale.payment_method === "CASH"
                            ? "Cash"
                            : sale.payment_method || "N/A"}
                        </td>
                        <td>
                          <span className={`status-badge ${status.toLowerCase()}`}>
                            {status === "PARTIALLY_PAID"
                              ? "Partially Paid"
                              : status === "PAID"
                              ? "Paid"
                              : "Unpaid"}
                          </span>
                        </td>
                        <td>
                          {balance > 0 ? (
                            <button
                              className="table-action edit-action"
                              onClick={() => openPaymentForm(sale)}
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="payment-complete">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        Batloung Farm Distribution System © 2026
      </footer>
    </div>
  );
}

export default Payments;
