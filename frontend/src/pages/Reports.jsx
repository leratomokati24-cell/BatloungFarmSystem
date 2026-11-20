
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/reports";

function Reports() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const [topFruits, setTopFruits] = useState([]);
  const [topVendor, setTopVendor] = useState(null);
  const [stock, setStock] = useState([]);
  const [revenue, setRevenue] = useState(null);

  const [startDate, setStartDate] = useState(toDateString(firstDay));
  const [endDate, setEndDate] = useState(toDateString(today));

  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState("");
  const [revenueError, setRevenueError] = useState("");

  function formatMoney(amount) {
    return `M ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const [fruitsResponse, vendorResponse, stockResponse] =
        await Promise.all([
          fetch(`${API}/top-fruits`),
          fetch(`${API}/top-vendor`),
          fetch(`${API}/stock`)
        ]);

      const fruitsData = await fruitsResponse.json();
      const vendorData = await vendorResponse.json();
      const stockData = await stockResponse.json();

      if (!fruitsResponse.ok || !vendorResponse.ok || !stockResponse.ok) {
        throw new Error("Could not load all reports.");
      }

      setTopFruits(fruitsData);
      setTopVendor(vendorData.length > 0 ? vendorData[0] : null);
      setStock(stockData);

    } catch (err) {
      console.error("Reports loading error:", err);
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRevenue(e) {
    if (e) e.preventDefault();

    if (!startDate || !endDate) {
      setRevenueError("Please select both dates.");
      return;
    }

    if (startDate > endDate) {
      setRevenueError("Start date cannot be after end date.");
      return;
    }

    try {
      setRevenueLoading(true);
      setRevenueError("");

      const response = await fetch(
        `${API}/revenue?start_date=${startDate}&end_date=${endDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load revenue report.");
      }

      setRevenue(data);
    } catch (err) {
      console.error("Revenue report error:", err);
      setRevenueError(err.message || "Unable to load revenue report.");
    } finally {
      setRevenueLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    loadRevenue();
  }, []);

  return (
    <div className="dashboard-content reports-page">

      <div className="page-heading">
        <div>
          <h2>Business Reports</h2>
          <p>View farm purchases, sales performance and available stock.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            loadReports();
            loadRevenue();
          }}
        >
          Refresh Reports
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          <section className="reports-grid">

            <div className="content-card report-card">
              <div className="card-heading">
                <div>
                  <h3>Top Five Purchased Fruits</h3>
                  <p>Fruits purchased most from suppliers</p>
                </div>
              </div>

              {topFruits.length === 0 ? (
                <p>No purchase records available.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Fruit</th>
                        <th>Total Boxes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFruits.map((fruit, index) => (
                        <tr key={fruit.fruit_name}>
                          <td>{index + 1}</td>
                          <td>{fruit.fruit_name}</td>
                          <td>{Number(fruit.total_boxes).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="content-card report-card">
              <div className="card-heading">
                <div>
                  <h3>Top Vendor</h3>
                  <p>Vendor who purchased the most boxes</p>
                </div>
              </div>

              {topVendor ? (
                <div className="top-vendor-details">
                  <span>Vendor Name</span>
                  <h2>{topVendor.vendor_name}</h2>

                  <span>Total Boxes Purchased</span>
                  <h3>
                    {Number(topVendor.total_boxes).toLocaleString()}
                  </h3>

                  <span>Vendor ID: {topVendor.vendor_id}</span>
                </div>
              ) : (
                <p>No vendor sales records available.</p>
              )}
            </div>

          </section>

          <section className="content-card report-card revenue-report">
            <div className="card-heading">
              <div>
                <h3>Revenue Report</h3>
                <p>Calculate revenue within a selected date range</p>
              </div>
            </div>

            <form className="revenue-form" onSubmit={loadRevenue}>
              <div className="form-field">
                <label htmlFor="reportStartDate">Start Date</label>
                <input
                  id="reportStartDate"
                  type="date"
                  value={startDate}
                  max={toDateString(today)}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="reportEndDate">End Date</label>
                <input
                  id="reportEndDate"
                  type="date"
                  value={endDate}
                  max={toDateString(today)}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={revenueLoading}
              >
                {revenueLoading ? "Generating..." : "Generate Report"}
              </button>
            </form>

            {revenueError && (
              <div className="error-message">{revenueError}</div>
            )}

            {revenue && (
              <div className="revenue-results">
                <div className="stat-card">
                  <span>Total Sales Transactions</span>
                  <h3>{Number(revenue.total_sales || 0)}</h3>
                </div>

                <div className="stat-card">
                  <span>Total Revenue</span>
                  <h3>{formatMoney(revenue.total_revenue)}</h3>
                </div>
              </div>
            )}
          </section>

          <section className="content-card report-card stock-report">
            <div className="card-heading">
              <div>
                <h3>Stock Report</h3>
                <p>Available stock according to fruit and packaging size</p>
              </div>
            </div>

            {stock.length === 0 ? (
              <p>No stock records available.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Fruit</th>
                      <th>Packaging Size</th>
                      <th>Available Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item, index) => (
                      <tr key={`${item.fruit_name}-${item.packaging_size}-${index}`}>
                        <td>{item.fruit_name}</td>
                        <td>{item.packaging_size}</td>
                        <td>
                          {Number(item.available_quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        Batloung Farm Distribution System © 2026
      </footer>
    </div>
  );
}

export default Reports;
