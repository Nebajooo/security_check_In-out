import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveCompanyEquipment, companyEquipmentIn } from "../services/api";

function CompanyEquipmentIn() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [selected, setSelected] = useState(null);
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const res = await getActiveCompanyEquipment();
      setEquipment(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selected) return;

    if (
      !window.confirm(
        `Return equipment: ${selected.equipmentName}\nStaff: ${selected.staffName}\n\nConfirm return?`,
      )
    ) {
      return;
    }

    try {
      await companyEquipmentIn({
        transactionId: selected._id,
        condition,
        notes,
      });
      alert(
        `✅ Equipment returned by ${selected.staffName}\n\nVerified by: ${currentUser.name}`,
      );
      navigate("/dashboard");
    } catch (error) {
      alert(
        "Error: " +
          (error.response?.data?.error || "Failed to return equipment"),
      );
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
          <h1>📥 RETURN EQUIPMENT</h1>
          <div style={{ width: "60px" }}></div>
        </div>
        <div style={styles.form}>
          <div style={styles.section}>
            <h3>📋 Equipment Details</h3>
            <p>
              <strong>Equipment:</strong> {selected.equipmentName} x
              {selected.quantity}
            </p>
            <p>
              <strong>Staff:</strong> {selected.staffName}
            </p>
            <p>
              <strong>Department:</strong> {selected.staffDepartment || "N/A"}
            </p>
            <p>
              <strong>Checked out:</strong>{" "}
              {new Date(selected.timestamp).toLocaleString()}
            </p>
            <p>
              <strong>Checked out by:</strong> {selected.securityName}
            </p>
            <p>
              <strong>Expected return:</strong>{" "}
              {new Date(selected.expectedReturnTime).toLocaleString()}
            </p>
            {selected.purpose && (
              <p>
                <strong>Purpose:</strong> {selected.purpose}
              </p>
            )}
          </div>
          <div style={styles.section}>
            <h3>📝 Return Condition</h3>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={styles.select}
            >
              <option>Good</option>
              <option>Damaged</option>
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
            <button onClick={handleReturn} style={styles.confirmBtn}>
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
        <h1>📥 STAFF RETURNING EQUIPMENT</h1>
        <div style={{ width: "60px" }}></div>
      </div>

      <div style={styles.list}>
        <h3>Select equipment to return:</h3>
        {equipment.length === 0 ? (
          <div style={styles.empty}>No company equipment currently out</div>
        ) : (
          equipment.map((item) => {
            const isOverdue = new Date(item.expectedReturnTime) < new Date();
            return (
              <div
                key={item._id}
                style={{
                  ...styles.card,
                  borderLeft: isOverdue
                    ? "4px solid #f44336"
                    : "4px solid #4caf50",
                }}
                onClick={() => setSelected(item)}
              >
                <div style={styles.cardHeader}>
                  <strong>{item.equipmentName}</strong>
                  {isOverdue && (
                    <span style={styles.overdueBadge}>OVERDUE</span>
                  )}
                </div>
                <p>
                  👤 {item.staffName} | {item.staffDepartment || "Staff"}
                </p>
                <p>👮 Checked out by: {item.securityName}</p>
                <p>
                  📅 Expected:{" "}
                  {new Date(item.expectedReturnTime).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  header: {
    background: "#9c27b0",
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
    background: "#9c27b0",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  empty: { textAlign: "center", padding: "40px", color: "#666" },
  overdueBadge: {
    background: "#f44336",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default CompanyEquipmentIn;
