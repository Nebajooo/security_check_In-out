import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveCheckouts, checkIn } from "../services/api";

function CheckInScreen() {
  const navigate = useNavigate();
  const [checkouts, setCheckouts] = useState([]);
  const [filter, setFilter] = useState("all"); // all, guest, staff
  const [selected, setSelected] = useState(null);
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckouts();
  }, []);

  const loadCheckouts = async () => {
    try {
      const res = await getActiveCheckouts();
      setCheckouts(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCheckouts = checkouts.filter((item) => {
    if (filter === "all") return true;
    return item.personType === filter;
  });

  const getPersonDisplay = (item) => {
    if (item.personType === "guest") {
      return `${item.guestName} (Room ${item.roomNumber})`;
    }
    return `${item.staffName} (${item.staffDepartment || "Staff"})`;
  };

  const getPersonIcon = (type) => (type === "guest" ? "🏨" : "👔");

  const handleCheckIn = async () => {
    if (!selected) return;
    try {
      await checkIn({
        outTransactionId: selected._id,
        conditionIn: condition,
        notes,
      });
      alert("✅ Equipment returned successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Failed to check in"));
    }
  };

  if (loading)
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
      </div>
    );

  if (selected) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => setSelected(null)} style={styles.backBtn}>
            ← Back
          </button>
          <h1>CHECK IN</h1>
          <div style={{ width: "60px" }}></div>
        </div>
        <div style={styles.form}>
          <div style={styles.section}>
            <h3>📋 Original Checkout</h3>
            <p>
              <strong>Equipment:</strong> {selected.equipmentName} x
              {selected.quantity}
            </p>
            <p>
              <strong>Person Type:</strong> {getPersonIcon(selected.personType)}{" "}
              {selected.personType.toUpperCase()}
            </p>
            <p>
              <strong>Taken by:</strong> {getPersonDisplay(selected)}
            </p>
            <p>
              <strong>Checked out:</strong>{" "}
              {new Date(selected.timestamp).toLocaleString()}
            </p>
            {selected.expectedReturnTime && (
              <p>
                <strong>Expected:</strong>{" "}
                {new Date(selected.expectedReturnTime).toLocaleString()}
              </p>
            )}
          </div>
          <div style={styles.section}>
            <h3>📝 Return Details</h3>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={styles.select}
            >
              <option>Good</option>
              <option>Damaged</option>
              <option>Missing Parts</option>
            </select>
            <textarea
              placeholder="Notes (if damaged)"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
            />
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={() => setSelected(null)} style={styles.cancelBtn}>
              Cancel
            </button>
            <button onClick={handleCheckIn} style={styles.confirmBtn}>
              ✅ Confirm Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1>CHECK IN</h1>
        <div style={{ width: "60px" }}></div>
      </div>

      <div style={styles.filterTabs}>
        <button
          onClick={() => setFilter("all")}
          style={{
            ...styles.filterTab,
            background: filter === "all" ? "#667eea" : "#f5f5f5",
            color: filter === "all" ? "white" : "#333",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("guest")}
          style={{
            ...styles.filterTab,
            background: filter === "guest" ? "#2196f3" : "#f5f5f5",
            color: filter === "guest" ? "white" : "#333",
          }}
        >
          🏨 Guests
        </button>
        <button
          onClick={() => setFilter("staff")}
          style={{
            ...styles.filterTab,
            background: filter === "staff" ? "#ff9800" : "#f5f5f5",
            color: filter === "staff" ? "white" : "#333",
          }}
        >
          👔 Staff
        </button>
      </div>

      <div style={styles.list}>
        {filteredCheckouts.length === 0 ? (
          <p style={styles.empty}>No equipment currently out</p>
        ) : (
          filteredCheckouts.map((item) => (
            <div
              key={item._id}
              style={styles.card}
              onClick={() => setSelected(item)}
            >
              <div style={styles.cardHeader}>
                <strong>{item.equipmentName}</strong>
                <span
                  style={{
                    background:
                      item.personType === "guest" ? "#2196f3" : "#ff9800",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                >
                  {getPersonIcon(item.personType)} {item.personType}
                </span>
              </div>
              <p>{getPersonDisplay(item)}</p>
              <small>{new Date(item.timestamp).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  header: {
    background: "#4caf50",
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
  filterTabs: {
    display: "flex",
    gap: "10px",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  filterTab: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
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
  list: { maxWidth: "600px", margin: "0 auto", padding: "20px" },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  select: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "inherit",
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
  confirmBtn: {
    flex: 2,
    padding: "15px",
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  empty: { textAlign: "center", padding: "40px", color: "#666" },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default CheckInScreen;
