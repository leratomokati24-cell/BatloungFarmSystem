
import { useState, useEffect } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import "./App.css";
import "./styles/pages.css";

import Stock from "./pages/Stock";
import Suppliers from "./pages/Suppliers";
import Vendors from "./pages/Vendors";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import BusinessLocation from "./pages/BusinessLocation";

const API = "https://batloungfarmsystem-production.up.railway.app";

const navigation = [
  "Dashboard",
  "Fruits",
  "Stock",
  "Suppliers",
  "Vendors",
  "Purchases",
  "Sales",
  "Payments",
  "Reports",
  "Business Location"
];

const daysOfWeek = [
  { day: "Mon", dayNumber: 2 },
  { day: "Tue", dayNumber: 3 },
  { day: "Wed", dayNumber: 4 },
  { day: "Thu", dayNumber: 5 },
  { day: "Fri", dayNumber: 6 },
  { day: "Sat", dayNumber: 7 },
  { day: "Sun", dayNumber: 1 }
];

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalStock: 0,
    totalVendors: 0
  });

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [recentSales, setRecentSales] = useState([]);
  const [recentSalesLoading, setRecentSalesLoading] = useState(true);
  const [recentSalesError, setRecentSalesError] = useState("");

  const [weeklySales, setWeeklySales] = useState(
    daysOfWeek.map(item => ({
      day: item.day,
      sales: 0
    }))
  );

  const [weeklySalesLoading, setWeeklySalesLoading] = useState(true);
  const [weeklySalesError, setWeeklySalesError] = useState("");

  const [quickSummary, setQuickSummary] = useState({
    totalPurchases: 0,
    totalSales: 0,
    outstandingPayments: 0,
    outstandingAmount: 0
  });

  const [quickSummaryLoading, setQuickSummaryLoading] = useState(true);
  const [quickSummaryError, setQuickSummaryError] = useState("");

  // Fruit Management state
  const [fruits, setFruits] = useState([]);
  const [fruitLoading, setFruitLoading] = useState(false);
  const [fruitError, setFruitError] = useState("");
  const [fruitMessage, setFruitMessage] = useState("");
  const [fruitSearch, setFruitSearch] = useState("");

  const [showFruitForm, setShowFruitForm] = useState(false);
  const [editingFruitId, setEditingFruitId] = useState(null);

  const [fruitName, setFruitName] = useState("");
  const [fruitDescription, setFruitDescription] = useState("");
  const [fruitSaving, setFruitSaving] = useState(false);

  // Load dashboard information
  useEffect(() => {
    if (!token) {
      setDashboardLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await fetch(
          `${API}/api/reports/dashboard`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard.");
        }

        setDashboardData(data);
      } catch (error) {
        console.error(error);
        setDashboardError("Unable to load dashboard information.");
      } finally {
        setDashboardLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]);

  // Load recent sales
  useEffect(() => {
    if (!token) {
      setRecentSalesLoading(false);
      return;
    }

    async function fetchRecentSales() {
      try {
        setRecentSalesLoading(true);
        setRecentSalesError("");

        const response = await fetch(
          `${API}/api/reports/recent-sales`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load recent sales.");
        }

        setRecentSales(data);
      } catch (error) {
        console.error(error);
        setRecentSalesError("Unable to load recent sales.");
      } finally {
        setRecentSalesLoading(false);
      }
    }

    fetchRecentSales();
  }, [token]);

  // Load weekly sales
  useEffect(() => {
    if (!token) {
      setWeeklySalesLoading(false);
      return;
    }

    async function fetchWeeklySales() {
      try {
        setWeeklySalesLoading(true);
        setWeeklySalesError("");

        const response = await fetch(
          `${API}/api/reports/weekly-sales`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load weekly sales.");
        }

        const updatedSales = daysOfWeek.map(item => {
          const matchingDay = data.find(
            sale => Number(sale.dayNumber) === item.dayNumber
          );

          return {
            day: item.day,
            sales: matchingDay ? Number(matchingDay.sales) : 0
          };
        });

        setWeeklySales(updatedSales);
      } catch (error) {
        console.error(error);
        setWeeklySalesError("Unable to load weekly sales.");
      } finally {
        setWeeklySalesLoading(false);
      }
    }

    fetchWeeklySales();
  }, [token]);

  // Load quick summary
  useEffect(() => {
    if (!token) {
      setQuickSummaryLoading(false);
      return;
    }

    async function fetchQuickSummary() {
      try {
        setQuickSummaryLoading(true);
        setQuickSummaryError("");

        const response = await fetch(
          `${API}/api/reports/quick-summary`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load quick summary.");
        }

        setQuickSummary(data);
      } catch (error) {
        console.error(error);
        setQuickSummaryError("Unable to load quick summary.");
      } finally {
        setQuickSummaryLoading(false);
      }
    }

    fetchQuickSummary();
  }, [token]);

  // Load fruits when Fruit Management is opened
  useEffect(() => {
    if (!token || activePage !== "Fruits") {
      return;
    }

    fetchFruits();
  }, [token, activePage]);

  async function fetchFruits() {
    try {
      setFruitLoading(true);
      setFruitError("");

      const response = await fetch(`${API}/api/fruits`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load fruits.");
      }

      setFruits(data);
    } catch (error) {
      console.error("Fruit loading error:", error);
      setFruitError(error.message || "Unable to load fruits.");
    } finally {
      setFruitLoading(false);
    }
  }

  // Reset fruit form
  function resetFruitForm() {
    setFruitName("");
    setFruitDescription("");
    setEditingFruitId(null);
    setShowFruitForm(false);
  }

  // Open form to add a fruit
  function openAddFruitForm() {
    setFruitMessage("");
    setFruitError("");
    setFruitName("");
    setFruitDescription("");
    setEditingFruitId(null);
    setShowFruitForm(true);
  }

  // Open form to edit a fruit
  function openEditFruitForm(fruit) {
    setFruitMessage("");
    setFruitError("");
    setFruitName(fruit.fruit_name || "");
    setFruitDescription(fruit.description || "");
    setEditingFruitId(fruit.fruit_id);
    setShowFruitForm(true);
  }

  // Add or update fruit
  async function handleFruitSubmit(e) {
    e.preventDefault();

    if (!fruitName.trim()) {
      setFruitError("Please enter a fruit name.");
      return;
    }

    try {
      setFruitSaving(true);
      setFruitError("");
      setFruitMessage("");

      const isEditing = editingFruitId !== null;

      const url = isEditing
        ? `${API}/api/fruits/${editingFruitId}`
        : `${API}/api/fruits`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fruit_name: fruitName.trim(),
          description: fruitDescription.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save fruit.");
      }

      resetFruitForm();

      setFruitMessage(
        isEditing
          ? "Fruit updated successfully."
          : "Fruit added successfully."
      );

      await fetchFruits();
    } catch (error) {
      setFruitError(error.message || "Could not save fruit.");
    } finally {
      setFruitSaving(false);
    }
  }

  // Change fruit status
  async function handleFruitStatus(fruit) {
    const currentStatus = String(fruit.status || "ACTIVE").toUpperCase();
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setFruitError("");
      setFruitMessage("");

      const response = await fetch(
        `${API}/api/fruits/${fruit.fruit_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update fruit status.");
      }

      setFruitMessage(data.message);
      await fetchFruits();
    } catch (error) {
      setFruitError(error.message || "Could not update fruit status.");
    }
  }

  // Delete fruit
  async function handleDeleteFruit(fruit) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${fruit.fruit_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setFruitError("");
      setFruitMessage("");

      const response = await fetch(
        `${API}/api/fruits/${fruit.fruit_id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete fruit.");
      }

      setFruitMessage(data.message);
      await fetchFruits();
    } catch (error) {
      setFruitError(error.message || "Could not delete fruit.");
    }
  }

  // Search fruits
  const filteredFruits = fruits.filter(fruit =>
    String(fruit.fruit_name || "")
      .toLowerCase()
      .includes(fruitSearch.toLowerCase())
  );

  function formatSaleDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function formatPaymentStatus(status) {
    if (status === "PAID") return "Paid";
    if (status === "UNPAID") return "Unpaid";
    if (status === "PARTIALLY_PAID") return "Partially Paid";

    return status;
  }

  function formatMoney(amount) {
    return `M ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Administrator login
  async function handleLogin(e) {
    e.preventDefault();

    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Invalid username or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setLoggedInUser(data.user);
      setPassword("");
      setActivePage("Dashboard");
    } catch (error) {
      setLoginError(
        "Cannot connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setLoggedInUser(null);
    setUsername("");
    setPassword("");
    setLoginError("");
    setActivePage("Dashboard");
  }

  // Login page
  if (!token || !loggedInUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <h1>Batloung Farm</h1>
            <p>Distribution Management System</p>
          </div>

          <div className="login-heading">
            <h2>Administrator Login</h2>
            <p>Sign in to manage your farm distribution activities.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {loginError && (
              <div className="error-message" role="alert">
                {loginError}
              </div>
            )}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">
            Batloung Farm Distribution System © 2026
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Sales",
      value: formatMoney(dashboardData.totalSales),
      note: "Sales recorded"
    },
    {
      title: "Total Purchases",
      value: formatMoney(dashboardData.totalPurchases),
      note: "Purchases recorded"
    },
    {
      title: "Available Stock",
      value: Number(dashboardData.totalStock).toLocaleString("en-US"),
      note: "Boxes available"
    },
    {
      title: "Registered Vendors",
      value: Number(dashboardData.totalVendors).toLocaleString("en-US"),
      note: "Registered vendors"
    }
  ];

  return (
    <div className="app-container">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div>
            <h2>Batloung Farm</h2>
            <span>Distribution System</span>
          </div>
        </div>

        <div className="menu-heading">MAIN MENU</div>

        <nav className="navigation">
          {navigation.map(item => (
            <button
              key={item}
              className={`nav-item ${activePage === item ? "active" : ""}`}
              onClick={() => {
                setActivePage(item);
                setSidebarOpen(false);
              }}
            >
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-details">
              <strong>{loggedInUser.full_name}</strong>
              <span>System Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              Menu
            </button>

            <div>
              <h1>{activePage}</h1>
              <p>Welcome to Batloung Farm Distribution System</p>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="topbar-profile">
              <div>
                <strong>{loggedInUser.full_name}</strong>
                <span>Administrator</span>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <div className="dashboard-content">
            <div className="page-heading">
              <div>
                <h2>Dashboard Overview</h2>
                <p>
                  Here is an overview of your farm distribution activities.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => setActivePage("Sales")}
              >
                New Sale
              </button>
            </div>

            {dashboardLoading && <p>Loading dashboard information...</p>}
            {dashboardError && <p className="error-text">{dashboardError}</p>}

            <section className="stats-grid">
              {stats.map(stat => (
                <div className="stat-card" key={stat.title}>
                  <div className="stat-top">
                    <span>{stat.title}</span>
                  </div>
                  <h3>{stat.value}</h3>
                  <span>{stat.note}</span>
                </div>
              ))}
            </section>

            <section className="dashboard-grid">
              <div className="content-card chart-card">
                <div className="card-heading">
                  <div>
                    <h3>Sales Overview</h3>
                    <p>Actual sales performance during the week</p>
                  </div>
                  <span className="chart-period">This Week</span>
                </div>

                {weeklySalesLoading && <p>Loading weekly sales...</p>}
                {weeklySalesError && (
                  <p className="error-text">{weeklySalesError}</p>
                )}

                {!weeklySalesLoading && !weeklySalesError && (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklySales}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e9eee9"
                        />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          formatter={value => [formatMoney(value), "Sales"]}
                        />
                        <Bar
                          dataKey="sales"
                          fill="#26834a"
                          radius={[5, 5, 0, 0]}
                          barSize={34}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="content-card summary-card">
                <div className="card-heading">
                  <div>
                    <h3>Quick Summary</h3>
                    <p>Actual business activity</p>
                  </div>
                </div>

                {quickSummaryLoading && <p>Loading business activity...</p>}
                {quickSummaryError && (
                  <p className="error-text">{quickSummaryError}</p>
                )}

                {!quickSummaryLoading && !quickSummaryError && (
                  <>
                    <div className="summary-item">
                      <div>
                        <strong>Purchases</strong>
                        <span>Total purchase transactions</span>
                      </div>
                      <b>{quickSummary.totalPurchases}</b>
                    </div>

                    <div className="summary-item">
                      <div>
                        <strong>Sales</strong>
                        <span>Total sales transactions</span>
                      </div>
                      <b>{quickSummary.totalSales}</b>
                    </div>

                    <div className="summary-item">
                      <div>
                        <strong>Outstanding Payments</strong>
                        <span>
                          {formatMoney(quickSummary.outstandingAmount)} due
                        </span>
                      </div>
                      <b>{quickSummary.outstandingPayments}</b>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="content-card recent-sales-card">
              <div className="card-heading">
                <div>
                  <h3>Recent Sales</h3>
                  <p>Latest sales transactions from your database</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => setActivePage("Sales")}
                >
                  View All
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Vendor</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentSalesLoading ? (
                      <tr>
                        <td colSpan="5">Loading recent sales...</td>
                      </tr>
                    ) : recentSalesError ? (
                      <tr>
                        <td colSpan="5">{recentSalesError}</td>
                      </tr>
                    ) : recentSales.length === 0 ? (
                      <tr>
                        <td colSpan="5">No sales records found.</td>
                      </tr>
                    ) : (
                      recentSales.map(sale => (
                        <tr key={sale.sale_id}>
                          <td>
                            SAL-{String(sale.sale_id).padStart(3, "0")}
                          </td>
                          <td>{sale.vendor_name}</td>
                          <td>{formatSaleDate(sale.sale_date)}</td>
                          <td className="amount-cell">
                            {formatMoney(sale.total_amount)}
                          </td>
                          <td>
                            <span
                              className={`status ${
                                sale.payment_status === "PAID"
                                  ? "paid"
                                  : sale.payment_status === "UNPAID"
                                  ? "unpaid"
                                  : "partial"
                              }`}
                            >
                              {formatPaymentStatus(sale.payment_status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className="footer">
              Batloung Farm Distribution System © 2026
            </footer>
          </div>
        )}

        {/* FRUIT MANAGEMENT */}
        {activePage === "Fruits" && (
          <div className="dashboard-content">
            <div className="page-heading">
              <div>
                <h2>Fruit Management</h2>
                <p>
                  Manage the fruits available in your farm distribution system.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openAddFruitForm}
              >
                Add New Fruit
              </button>
            </div>

            <div className="fruit-summary-grid">
              <div className="stat-card">
                <span>Total Fruits</span>
                <h3>{fruits.length}</h3>
                <span>Registered fruit types</span>
              </div>

              <div className="stat-card">
                <span>Active Fruits</span>
                <h3>
                  {fruits.filter(
                    fruit =>
                      String(fruit.status || "ACTIVE").toUpperCase() === "ACTIVE"
                  ).length}
                </h3>
                <span>Available for use</span>
              </div>

              <div className="stat-card">
                <span>Inactive Fruits</span>
                <h3>
                  {fruits.filter(
                    fruit =>
                      String(fruit.status || "").toUpperCase() === "INACTIVE"
                  ).length}
                </h3>
                <span>Currently deactivated</span>
              </div>
            </div>

            {fruitMessage && (
              <div className="success-message" role="status">
                {fruitMessage}
              </div>
            )}

            {fruitError && (
              <div className="error-message fruit-alert" role="alert">
                {fruitError}
              </div>
            )}

            {showFruitForm && (
              <section className="content-card fruit-form-card">
                <div className="card-heading">
                  <div>
                    <h3>
                      {editingFruitId ? "Edit Fruit" : "Add New Fruit"}
                    </h3>
                    <p>
                      Enter the fruit information below.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleFruitSubmit} className="fruit-form">
                  <div className="form-field">
                    <label htmlFor="fruitName">Fruit Name</label>
                    <input
                      id="fruitName"
                      type="text"
                      placeholder="For example, Apples"
                      value={fruitName}
                      onChange={e => setFruitName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="fruitDescription">Description</label>
                    <textarea
                      id="fruitDescription"
                      placeholder="Enter a short description (optional)"
                      value={fruitDescription}
                      onChange={e => setFruitDescription(e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="fruit-form-actions">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={fruitSaving}
                    >
                      {fruitSaving
                        ? "Saving..."
                        : editingFruitId
                        ? "Update Fruit"
                        : "Save Fruit"}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetFruitForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="content-card fruit-table-card">
              <div className="fruit-table-heading">
                <div>
                  <h3>Registered Fruits</h3>
                  <p>All fruits saved in the database</p>
                </div>

                <input
                  className="fruit-search"
                  type="search"
                  placeholder="Search fruit name..."
                  value={fruitSearch}
                  onChange={e => setFruitSearch(e.target.value)}
                />
              </div>

              {fruitLoading ? (
                <p className="table-message">Loading fruits...</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Fruit ID</th>
                        <th>Fruit Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFruits.length === 0 ? (
                        <tr>
                          <td colSpan="5">
                            {fruitSearch
                              ? "No fruits match your search."
                              : "No fruits have been registered yet."}
                          </td>
                        </tr>
                      ) : (
                        filteredFruits.map(fruit => {
                          const isActive =
                            String(fruit.status || "ACTIVE").toUpperCase() ===
                            "ACTIVE";

                          return (
                            <tr key={fruit.fruit_id}>
                              <td>FRU-{String(fruit.fruit_id).padStart(3, "0")}</td>
                              <td className="fruit-name-cell">
                                {fruit.fruit_name}
                              </td>
                              <td className="fruit-description-cell">
                                {fruit.description || "No description"}
                              </td>
                              <td>
                                <span
                                  className={`fruit-status ${
                                    isActive ? "fruit-active" : "fruit-inactive"
                                  }`}
                                >
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td>
                                <div className="fruit-actions">
                                  <button
                                    className="table-action edit-action"
                                    onClick={() => openEditFruitForm(fruit)}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="table-action status-action"
                                    onClick={() => handleFruitStatus(fruit)}
                                  >
                                    {isActive ? "Deactivate" : "Activate"}
                                  </button>

                                  <button
                                    className="table-action delete-action"
                                    onClick={() => handleDeleteFruit(fruit)}
                                  >
                                    Delete
                                  </button>
                                </div>
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
        )}

        {/* STOCK MANAGEMENT */}
        {activePage === "Stock" && <Stock />}

        {/* SUPPLIER MANAGEMENT */}
        {activePage === "Suppliers" && <Suppliers />}

        {/* VENDOR MANAGEMENT */}
        {activePage === "Vendors" && <Vendors />}

        {/* PURCHASE MANAGEMENT */}
        {activePage === "Purchases" && <Purchases />}

        {/* SALES MANAGEMENT */}
        {activePage === "Sales" && <Sales />}

        {/* PAYMENTS MANAGEMENT */}
        {activePage === "Payments" && <Payments />}

        {/* REPORTS MANAGEMENT */}
        {activePage === "Reports" && <Reports />}

        {/* BUSINESS LOCATION */}
        {activePage === "Business Location" && <BusinessLocation />}

        {/* OTHER SECTIONS */}
        {activePage !== "Dashboard" &&
          activePage !== "Fruits" &&
          activePage !== "Stock" &&
          activePage !== "Suppliers" &&
          activePage !== "Vendors" &&
          activePage !== "Purchases" &&
          activePage !== "Sales" &&
          activePage !== "Payments" &&
          activePage !== "Reports" &&
          activePage !== "Business Location" && (
            <div className="coming-soon">
              <h2>{activePage}</h2>
              <p>
                This section will be developed next and connected to the database.
              </p>

              <button
                className="primary-button"
                onClick={() => setActivePage("Dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;

