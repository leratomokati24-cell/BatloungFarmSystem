
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/vendors";

function Vendors() {
    const emptyForm = {
        vendor_name: "",
        phone_number: "",
        location: ""
    };

    const [vendors, setVendors] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Load vendors
    async function loadVendors() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load vendors.");
            }

            setVendors(data);
        } catch (err) {
            setError(err.message || "Failed to fetch vendors.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVendors();
    }, []);

    // Handle form changes
    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    // Add or update vendor
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setMessage("");

            const url = editingId
                ? `${API}/${editingId}`
                : API;

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Vendor operation failed.");
            }

            setMessage(data.message || "Vendor saved successfully.");
            setForm(emptyForm);
            setEditingId(null);

            await loadVendors();
        } catch (err) {
            setError(err.message);
        }
    }

    // Edit vendor
    function handleEdit(vendor) {
        setEditingId(vendor.vendor_id);

        setForm({
            vendor_name: vendor.vendor_name || "",
            phone_number: vendor.phone_number || "",
            location: vendor.location || ""
        });

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // Delete vendor
    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this vendor?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            const response = await fetch(`${API}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete vendor.");
            }

            setMessage(data.message || "Vendor deleted successfully.");

            await loadVendors();
        } catch (err) {
            setError(err.message);
        }
    }

    // Cancel editing
    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setMessage("");
    }

    // Search vendors
    const filteredVendors = vendors.filter((vendor) =>
        [
            vendor.vendor_name,
            vendor.phone_number,
            vendor.location
        ]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-content vendors-page">

            <div className="page-heading">
                <div>
                    <h2>Vendor Management</h2>
                    <p>Register and manage your fruit vendors.</p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {/* Vendor Summary */}
            <div className="vendors-summary-grid">

                <div className="stat-card">
                    <span>Total Vendors</span>
                    <h3>{vendors.length}</h3>
                    <span>Registered vendors</span>
                </div>

                <div className="stat-card">
                    <span>Search Results</span>
                    <h3>{filteredVendors.length}</h3>
                    <span>Matching vendors</span>
                </div>

            </div>

            {/* Vendor Form */}
            <section className="content-card vendor-form-card">

                <div className="vendor-section-heading">
                    <div>
                        <h3>
                            {editingId ? "Update Vendor" : "Register New Vendor"}
                        </h3>
                        <p>
                            Enter the vendor's details below.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="vendor-form">

                    <div className="vendor-form-grid">

                        <div className="vendor-field">
                            <label htmlFor="vendor_name">Vendor Name</label>
                            <input
                                id="vendor_name"
                                type="text"
                                name="vendor_name"
                                value={form.vendor_name}
                                onChange={handleChange}
                                placeholder="Enter vendor name"
                                required
                            />
                        </div>

                        <div className="vendor-field">
                            <label htmlFor="phone_number">Phone Number</label>
                            <input
                                id="phone_number"
                                type="text"
                                name="phone_number"
                                value={form.phone_number}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                            />
                        </div>

                        <div className="vendor-field vendor-full-width">
                            <label htmlFor="location">Location</label>
                            <input
                                id="location"
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Enter vendor location"
                                required
                            />
                        </div>

                    </div>

                    <div className="vendor-form-actions">

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            {editingId ? "Update Vendor" : "Save Vendor"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

            </section>

            {/* Vendor Records */}
            <section className="content-card vendor-records-card">

                <div className="vendor-records-heading">
                    <div>
                        <h3>Vendor Records</h3>
                        <p>All vendors registered in the system.</p>
                    </div>

                    <input
                        className="vendor-search"
                        type="search"
                        placeholder="Search vendors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="vendor-table-message">
                        Loading vendors...
                    </p>
                ) : (

                    <div className="table-wrapper">

                        <table className="vendor-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vendor Name</th>
                                    <th>Phone Number</th>
                                    <th>Location</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredVendors.length > 0 ? (

                                    filteredVendors.map((vendor) => (

                                        <tr key={vendor.vendor_id}>

                                            <td>
                                                VEN-{String(vendor.vendor_id).padStart(3, "0")}
                                            </td>

                                            <td className="vendor-name-cell">
                                                {vendor.vendor_name}
                                            </td>

                                            <td>{vendor.phone_number}</td>

                                            <td>{vendor.location}</td>

                                            <td>
                                                {vendor.registration_date
                                                    ? new Date(vendor.registration_date).toLocaleDateString()
                                                    : "N/A"}
                                            </td>

                                            <td>
                                                <div className="vendor-table-actions">

                                                    <button
                                                        type="button"
                                                        className="table-action edit-action"
                                                        onClick={() => handleEdit(vendor)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="table-action delete-action"
                                                        onClick={() => handleDelete(vendor.vendor_id)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan="6" className="vendor-empty">
                                            No vendors found.
                                        </td>
                                    </tr>

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

export default Vendors;
