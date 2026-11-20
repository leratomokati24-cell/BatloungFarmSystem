
import { useEffect, useState } from "react";

const API = "https://batloungfarmsystem-production.up.railway.app/api/suppliers";

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        business_name: "",
        contact_person: "",
        phone: "",
        province: "",
        address: ""
    });

    async function loadSuppliers() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load suppliers.");
            }

            setSuppliers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load suppliers.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSuppliers();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    }

    function openAddForm() {
        setFormData({
            business_name: "",
            contact_person: "",
            phone: "",
            province: "",
            address: ""
        });

        setEditingId(null);
        setError("");
        setMessage("");
        setShowForm(true);
    }

    function openEditForm(supplier) {
        setFormData({
            business_name: supplier.business_name || "",
            contact_person: supplier.contact_person || "",
            phone: supplier.phone || "",
            province: supplier.province || "",
            address: supplier.address || ""
        });

        setEditingId(supplier.supplier_id);
        setError("");
        setMessage("");
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            business_name: "",
            contact_person: "",
            phone: "",
            province: "",
            address: ""
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.business_name.trim()) {
            setError("Please enter the supplier business name.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const isEditing = editingId !== null;

            const response = await fetch(
                isEditing ? `${API}/${editingId}` : API,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        business_name: formData.business_name.trim(),
                        contact_person: formData.contact_person.trim(),
                        phone: formData.phone.trim(),
                        province: formData.province.trim(),
                        address: formData.address.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save supplier.");
            }

            closeForm();

            setMessage(
                isEditing
                    ? "Supplier updated successfully."
                    : "Supplier added successfully."
            );

            await loadSuppliers();
        } catch (err) {
            setError(err.message || "Unable to save supplier.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(supplier) {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${supplier.business_name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API}/${supplier.supplier_id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete supplier.");
            }

            setMessage("Supplier deleted successfully.");
            await loadSuppliers();
        } catch (err) {
            setError(err.message || "Unable to delete supplier.");
        }
    }

    const filteredSuppliers = suppliers.filter(supplier => {
        const searchText = search.toLowerCase();

        return (
            String(supplier.business_name || "").toLowerCase().includes(searchText) ||
            String(supplier.contact_person || "").toLowerCase().includes(searchText) ||
            String(supplier.province || "").toLowerCase().includes(searchText)
        );
    });

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <h1>Supplier Management</h1>
                    <p>Manage businesses that supply fruits to Batloung Farm.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    Add Supplier
                </button>
            </div>

            <div className="summary-grid">
                <div className="summary-card">
                    <p>Total Suppliers</p>
                    <h2>{suppliers.length}</h2>
                </div>

                <div className="summary-card">
                    <p>Provinces Represented</p>
                    <h2>
                        {new Set(
                            suppliers
                                .map(item => item.province)
                                .filter(Boolean)
                        ).size}
                    </h2>
                </div>

                <div className="summary-card">
                    <p>Search Results</p>
                    <h2>{filteredSuppliers.length}</h2>
                </div>
            </div>

            {message && (
                <div className="success-message" role="status">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message supplier-alert" role="alert">
                    {error}
                </div>
            )}

            {showForm && (
                <section className="content-card supplier-form-card">
                    <div className="section-heading">
                        <h2>
                            {editingId ? "Edit Supplier" : "Register New Supplier"}
                        </h2>
                        <p>Enter the supplier's business information.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="supplier-form">
                        <div className="supplier-form-grid">
                            <div className="form-field">
                                <label htmlFor="business_name">Business Name</label>
                                <input
                                    id="business_name"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    placeholder="Enter business name"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="contact_person">Contact Person</label>
                                <input
                                    id="contact_person"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    placeholder="Enter contact person's name"
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="province">Province</label>
                                <input
                                    id="province"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    placeholder="Enter province"
                                />
                            </div>

                            <div className="form-field supplier-address-field">
                                <label htmlFor="address">Business Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter business address"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="supplier-form-actions">
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Supplier"
                                    : "Save Supplier"}
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="content-card">
                <div className="section-heading">
                    <h2>Registered Suppliers</h2>
                    <p>Supplier information saved in the database.</p>
                </div>

                <div className="supplier-search-row">
                    <input
                        type="search"
                        placeholder="Search by business, contact person or province..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <button
                        className="secondary-button"
                        onClick={loadSuppliers}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="page-message">Loading suppliers...</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Supplier ID</th>
                                    <th>Business Name</th>
                                    <th>Contact Person</th>
                                    <th>Phone</th>
                                    <th>Province</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.map(supplier => (
                                        <tr key={supplier.supplier_id}>
                                            <td>
                                                SUP-{String(supplier.supplier_id).padStart(3, "0")}
                                            </td>
                                            <td>{supplier.business_name}</td>
                                            <td>{supplier.contact_person || "N/A"}</td>
                                            <td>{supplier.phone || "N/A"}</td>
                                            <td>{supplier.province || "N/A"}</td>
                                            <td>{supplier.address || "N/A"}</td>
                                            <td>
                                                <div className="supplier-actions">
                                                    <button
                                                        className="table-action edit-action"
                                                        onClick={() => openEditForm(supplier)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="table-action delete-action"
                                                        onClick={() => handleDelete(supplier)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="empty-table">
                                            No suppliers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Suppliers;

