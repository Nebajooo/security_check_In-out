import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ExportModal({ isOpen, onClose, data, title }) {
  const [exportType, setExportType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const filterData = () => {
    let filtered = [...data];

    // Filter by type
    if (exportType === "guest") {
      filtered = filtered.filter(
        (item) => item.transactionType === "guest_personal",
      );
    } else if (exportType === "company") {
      filtered = filtered.filter(
        (item) => item.transactionType === "company_equipment",
      );
    }

    // Filter by date range
    if (dateRange === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (item) => new Date(item.timestamp).toDateString() === today,
      );
    } else if (dateRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((item) => new Date(item.timestamp) >= weekAgo);
    } else if (dateRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (item) => new Date(item.timestamp) >= monthAgo,
      );
    } else if (dateRange === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date >= start && date <= end;
      });
    }

    return filtered;
  };

  const exportToExcel = () => {
    const filteredData = filterData();

    if (filteredData.length === 0) {
      alert("No data matches your filters");
      return;
    }

    setExporting(true);

    // Prepare data for export
    const exportData = filteredData.map((item) => {
      const row = {};

      // Basic Info
      row["Transaction #"] = item.transactionNumber || "";
      row["Date & Time"] = item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : "";
      row["Type"] =
        item.transactionType === "guest_personal"
          ? "Guest Personal"
          : "Company Equipment";
      row["Direction"] =
        item.direction === "IN" ? "Entering Hotel" : "Leaving Hotel";

      // Equipment Details
      row["Equipment Name"] = item.equipmentName || "";
      row["Quantity"] = item.quantity || 1;
      row["Brand"] = item.brand || "";
      row["Serial Number"] = item.serialNumber || "";
      row["Description"] = item.description || "";
      row["Condition"] = item.condition || "Good";

      // Person Details (Guest or Staff)
      if (item.transactionType === "guest_personal") {
        row["Guest Name"] = item.guestName || "";
        row["Room Number"] = item.roomNumber || "";
        row["Guest ID/Passport"] = item.guestId || "";
        row["Nationality"] = item.nationality || "";
        row["Staff Name"] = "";
        row["Department"] = "";
        row["Employee ID"] = "";
        row["Purpose"] = "";
      } else {
        row["Guest Name"] = "";
        row["Room Number"] = "";
        row["Guest ID/Passport"] = "";
        row["Nationality"] = "";
        row["Staff Name"] = item.staffName || "";
        row["Department"] = item.staffDepartment || "";
        row["Employee ID"] = item.staffEmployeeId || "";
        row["Purpose"] = item.purpose || "";
      }

      // Security & Status
      row["Security Guard"] = item.securityName || "";
      row["Status"] = item.isReturned ? "Returned" : "Active";
      if (item.expectedReturnTime) {
        row["Expected Return"] = new Date(
          item.expectedReturnTime,
        ).toLocaleString();
      }
      row["Reported to Manager"] = item.reportedToManager ? "Yes" : "No";
      row["Notes"] = item.notes || "";

      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Style the worksheet
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${title || "Transactions"}`,
    );

    // Generate and download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const filename = `${title || "transactions"}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;
    saveAs(blob, filename);

    setExporting(false);
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2>📊 Export Transactions</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label>Export Type:</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Transactions</option>
              <option value="guest">Guest Equipment Only</option>
              <option value="company">Company Equipment Only</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label>Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div style={styles.dateRange}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
                placeholder="Start Date"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
                placeholder="End Date"
              />
            </div>
          )}

          <div style={styles.infoBox}>
            <p>📋 This export includes:</p>
            <ul>
              <li>Transaction number, date, and type</li>
              <li>Equipment details (name, quantity, brand, serial)</li>
              <li>Person information (guest or staff)</li>
              <li>Security guard who processed the transaction</li>
              <li>Status and condition</li>
              <li>Notes and reports</li>
            </ul>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={styles.exportBtn}
            onClick={exportToExcel}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "📥 Export to Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "5px",
  },
  dateRange: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "10px",
  },
  dateInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
  },
  infoBox: {
    background: "#e3f2fd",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
    fontSize: "14px",
  },
  modalFooter: {
    display: "flex",
    gap: "10px",
    padding: "20px",
    borderTop: "1px solid #eee",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  },
  exportBtn: {
    flex: 2,
    padding: "12px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ExportModal;
