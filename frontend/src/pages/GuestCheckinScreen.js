import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { guestCheckIn } from "../services/api";

function GuestCheckinScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    equipmentName: "",
    quantity: 1,
    brand: "",
    serialNumber: "",
    description: "",
    guestName: "",
    guestId: "",
    roomNumber: "",
    nationality: "",
    condition: "Good",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.equipmentName.trim()) {
      alert("Please enter equipment name");
      return;
    }
    if (!form.guestName.trim()) {
      alert("Please enter guest name");
      return;
    }
    if (!form.roomNumber.trim()) {
      alert("Please enter room number");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting guest checkin:", form);
      const response = await guestCheckIn(form);
      console.log("Response:", response.data);

      alert(
        `✅ Equipment registered for ${form.guestName} (Room ${form.roomNumber})\n\nEquipment: ${form.equipmentName} x${form.quantity}\n\nRegistered by: ${currentUser.name || "Security"}\n\nGuest can now enter the hotel.`,
      );

      // Reset form
      setForm({
        equipmentName: "",
        quantity: 1,
        brand: "",
        serialNumber: "",
        description: "",
        guestName: "",
        guestId: "",
        roomNumber: "",
        nationality: "",
        condition: "Good",
        notes: "",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);

      const errorMsg =
        error.response?.data?.error || error.message || "Failed to register";
      alert("❌ Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1>🏨 GUEST ARRIVAL - REGISTER EQUIPMENT</h1>
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
              onChange={(e) =>
                setForm({ ...form, quantity: parseInt(e.target.value) || 1 })
              }
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
            placeholder="Description (color, model, etc.)"
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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
          <div style={styles.row}>
            <input
              type="text"
              placeholder="Room Number *"
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Guest ID / Passport"
              value={form.guestId}
              onChange={(e) => setForm({ ...form, guestId: e.target.value })}
            />
          </div>
          <input
            type="text"
            placeholder="Nationality"
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
        </div>

        <div style={styles.section}>
          <h3>📝 Additional Info</h3>
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          >
            <option>Good</option>
            <option>Damaged</option>
          </select>
          <textarea
            placeholder="Notes"
            rows="2"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div style={styles.warningBox}>
          ⚠️ Guest must present this equipment when checking out. Any
          unregistered equipment will not be allowed to leave.
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
            {loading ? "Processing..." : "✅ Register Equipment & Allow Entry"}
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
    background: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default GuestCheckinScreen;
