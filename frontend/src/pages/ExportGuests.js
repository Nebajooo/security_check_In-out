import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getActiveGuests } from "../services/api";

function ExportGuests() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const res = await getActiveGuests();
      setGuests(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = guests.map((item) => ({
      "Transaction #": item.transactionNumber,
      "Check-in Time": new Date(item.timestamp).toLocaleString(),
      "Guest Name": item.guestName,
      "Room Number": item.roomNumber,
      "Guest ID": item.guestId,
      Nationality: item.nationality,
      Equipment: item.equipmentName,
      Quantity: item.quantity,
      Brand: item.brand,
      "Serial #": item.serialNumber,
      Description: item.description,
      "Security Guard": item.securityName,
      Status: "Inside Hotel",
      Notes: item.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Guests");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `active_guests_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1>📊 Export Guest Data</h1>
        <button onClick={exportToExcel} style={styles.exportBtn}>
          📥 Download Excel
        </button>
      </div>

      <div style={styles.stats}>
        Total Active Guests: <strong>{guests.length}</strong>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Equipment</th>
              <th>Qty</th>
              <th>Check-in Time</th>
              <th>Security</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest._id}>
                <td>{guest.guestName}</td>
                <td>{guest.roomNumber}</td>
                <td>{guest.equipmentName}</td>
                <td>{guest.quantity}</td>
                <td>{new Date(guest.timestamp).toLocaleString()}</td>
                <td>{guest.securityName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#f5f5f5", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
  },
  backBtn: {
    padding: "10px 20px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  exportBtn: {
    padding: "10px 20px",
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  stats: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  tableContainer: {
    background: "white",
    borderRadius: "10px",
    overflow: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  loading: { textAlign: "center", padding: "50px" },
};

export default ExportGuests;
