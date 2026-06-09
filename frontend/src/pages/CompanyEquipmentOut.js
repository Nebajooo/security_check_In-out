import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { companyEquipmentOut } from "../services/api";

function CompanyEquipmentOut() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    equipmentName: "",
    quantity: 1,
    brand: "",
    serialNumber: "",
    description: "",
    staffName: "",
    staffDepartment: "",
    staffEmployeeId: "",
    purpose: "",
    expectedReturnTime: "",
    condition: "Good",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipmentName || !form.staffName || !form.expectedReturnTime) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await companyEquipmentOut(form);
      alert(
        `✅ Equipment checked out to ${form.staffName}\n\nChecked out by: ${currentUser.name}\n\nReminder: Must be returned by ${new Date(form.expectedReturnTime).toLocaleString()}`,
      );
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Failed to checkout"));
    } finally {
      setLoading(false);
    }
  };

  const setDefaultReturn = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    setForm({ ...form, expectedReturnTime: date.toISOString().slice(0, 16) });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1>📤 STAFF TAKING EQUIPMENT OUT</h1>
        <div style={{ width: "60px" }}></div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h3>🔧 Equipment Details</h3>
          <input
            type="text"
            placeholder="Equipment Name *"
            value={form.equipmentName}
            onChange={(e) =>
              setForm({ ...form, equipmentName: e.target.value })
            }
            required
          />
          <div style={styles.row}>
            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <input
              type="text"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <input
            type="text"
            placeholder="Serial Number"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
          <textarea
            placeholder="Description"
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div style={styles.section}>
          <h3>👤 Staff Information</h3>
          <input
            type="text"
            placeholder="Staff Name *"
            value={form.staffName}
            onChange={(e) => setForm({ ...form, staffName: e.target.value })}
            required
          />
          <div style={styles.row}>
            <input
              type="text"
              placeholder="Department"
              value={form.staffDepartment}
              onChange={(e) =>
                setForm({ ...form, staffDepartment: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Employee ID"
              value={form.staffEmployeeId}
              onChange={(e) =>
                setForm({ ...form, staffEmployeeId: e.target.value })
              }
            />
          </div>
          <input
            type="text"
            placeholder="Purpose of taking equipment"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          />
        </div>

        <div style={styles.section}>
          <h3>⏰ Return Details</h3>
          <div style={styles.row}>
            <input
              type="datetime-local"
              value={form.expectedReturnTime}
              onChange={(e) =>
                setForm({ ...form, expectedReturnTime: e.target.value })
              }
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={setDefaultReturn}
              style={styles.defaultBtn}
            >
              +1 day
            </button>
          </div>
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          >
            <option>Good</option>
            <option>Damaged</option>
          </select>
          <textarea
            placeholder="Additional Notes"
            rows="2"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div style={styles.warningBox}>
          ⚠️ Staff must return this equipment by the expected return time.
          Failure to return will be reported to management.
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Processing..." : "✅ Confirm Check Out"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  header: {
    background: "#ff9800",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  form: { maxWidth: "600px", margin: "0 auto", padding: "20px" },
  section: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  row: { display: "flex", gap: "15px" },
  defaultBtn: {
    padding: "0 20px",
    background: "#fff3e0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  warningBox: {
    background: "#fff3e0",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    borderLeft: "4px solid #ff9800",
    fontSize: "14px",
  },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "20px" },
  cancelBtn: {
    flex: 1,
    padding: "15px",
    background: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "10px",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 2,
    padding: "15px",
    background: "#ff9800",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default CompanyEquipmentOut;
