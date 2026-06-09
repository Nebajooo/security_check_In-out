import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkOut } from "../services/api";

function CheckOutScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    equipmentName: "",
    quantity: 1,
    brand: "",
    ownerName: "",
    ownerDepartment: "",
    ownerEmployeeId: "",
    expectedReturnTime: "",
    purpose: "",
    conditionOut: "Good",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipmentName || !form.ownerName || !form.expectedReturnTime) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await checkOut(form);
      alert("✅ Equipment checked out successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Failed to checkout"));
    } finally {
      setLoading(false);
    }
  };

  const setDefaultTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 8);
    setForm({ ...form, expectedReturnTime: date.toISOString().slice(0, 16) });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1>CHECK OUT</h1>
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
        </div>

        <div style={styles.section}>
          <h3>👤 Person Taking Equipment</h3>
          <input
            type="text"
            placeholder="Full Name *"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            required
          />
          <div style={styles.row}>
            <input
              type="text"
              placeholder="Department"
              value={form.ownerDepartment}
              onChange={(e) =>
                setForm({ ...form, ownerDepartment: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Employee ID"
              value={form.ownerEmployeeId}
              onChange={(e) =>
                setForm({ ...form, ownerEmployeeId: e.target.value })
              }
            />
          </div>
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
              onClick={setDefaultTime}
              style={styles.defaultBtn}
            >
              +8 hours
            </button>
          </div>
          <input
            type="text"
            placeholder="Purpose"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          />
          <select
            value={form.conditionOut}
            onChange={(e) => setForm({ ...form, conditionOut: e.target.value })}
          >
            <option>Good</option>
            <option>Damaged</option>
            <option>Missing Parts</option>
          </select>
          <textarea
            placeholder="Notes"
            rows="3"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
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
    background: "#e3f2fd",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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

export default CheckOutScreen;
