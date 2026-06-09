import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkOutGuest } from "../services/api";

function CheckOutGuest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    equipmentName: "",
    quantity: 1,
    brand: "",
    guestName: "",
    roomNumber: "",
    checkInDate: "",
    checkOutDate: "",
    expectedReturnTime: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipmentName || !form.guestName || !form.roomNumber) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await checkOutGuest(form);
      alert(`✅ Equipment checked out to guest in room ${form.roomNumber}`);
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Failed to checkout"));
    } finally {
      setLoading(false);
    }
  };

  const setDefaultReturn = () => {
    const date = new Date();
    date.setHours(date.getHours() + 4);
    setForm({ ...form, expectedReturnTime: date.toISOString().slice(0, 16) });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1>🏨 GUEST CHECK OUT</h1>
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
          <h3>👤 Guest Information</h3>
          <input
            type="text"
            placeholder="Guest Name *"
            value={form.guestName}
            onChange={(e) => setForm({ ...form, guestName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Room Number *"
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            required
          />
          <div style={styles.row}>
            <input
              type="date"
              placeholder="Check In Date"
              value={form.checkInDate}
              onChange={(e) =>
                setForm({ ...form, checkInDate: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="Check Out Date"
              value={form.checkOutDate}
              onChange={(e) =>
                setForm({ ...form, checkOutDate: e.target.value })
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
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={setDefaultReturn}
              style={styles.defaultBtn}
            >
              +4 hours
            </button>
          </div>
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
    background: "#2196f3",
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
    background: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default CheckOutGuest;
