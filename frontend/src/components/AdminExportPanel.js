import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getHistory,
  getStatistics,
  getActiveGuests,
  getActiveCompanyEquipment,
  getOverdueCompanyEquipment,
} from "../services/api";

function AdminExportPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("excel");
  const [stats, setStats] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsRes = await getStatistics();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadDataForExport = async () => {
    setLoading(true);
    try {
      let data = [];

      switch (reportType) {
        case "all":
          const allRes = await getHistory(1, 10000);
          data = allRes.data.transactions;
          break;
        case "guests":
          const guestsRes = await getActiveGuests();
          data = guestsRes.data;
          break;
        case "company":
          const companyRes = await getActiveCompanyEquipment();
          data = companyRes.data;
          break;
        case "overdue":
          const overdueRes = await getOverdueCompanyEquipment();
          data = overdueRes.data;
          break;
        case "checkins":
          const checkinsRes = await getHistory(1, 10000);
          data = checkinsRes.data.transactions.filter(
            (t) => t.direction === "IN",
          );
          break;
        case "checkouts":
          const checkoutsRes = await getHistory(1, 10000);
          data = checkoutsRes.data.transactions.filter(
            (t) => t.direction === "OUT",
          );
          break;
        default:
          const defaultRes = await getHistory(1, 10000);
          data = defaultRes.data.transactions;
      }

      // Apply date filter
      if (dateRange === "today") {
        const today = new Date().toDateString();
        data = data.filter(
          (item) => new Date(item.timestamp).toDateString() === today,
        );
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        data = data.filter((item) => new Date(item.timestamp) >= weekAgo);
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        data = data.filter((item) => new Date(item.timestamp) >= monthAgo);
      } else if (dateRange === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        data = data.filter((item) => {
          const date = new Date(item.timestamp);
          return date >= start && date <= end;
        });
      }

      setPreviewData(data.slice(0, 10));
      return data;
    } catch (error) {
      console.error("Error loading data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const data = await loadDataForExport();

    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = data.map((item) => ({
      "Transaction #": item.transactionNumber || "",
      "Date & Time": item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : "",
      Type:
        item.transactionType === "guest_personal" ? "🏨 Guest" : "📦 Company",
      Direction: item.direction === "IN" ? "IN (Entering)" : "OUT (Leaving)",
      "Equipment Name": item.equipmentName || "",
      Quantity: item.quantity || 1,
      Brand: item.brand || "",
      "Serial Number": item.serialNumber || "",
      Description: item.description || "",
      "Guest/Staff Name":
        item.transactionType === "guest_personal"
          ? item.guestName || ""
          : item.staffName || "",
      "Room/Department":
        item.transactionType === "guest_personal"
          ? item.roomNumber || ""
          : item.staffDepartment || "",
      "ID/Employee #":
        item.transactionType === "guest_personal"
          ? item.guestId || ""
          : item.staffEmployeeId || "",
      "Security Guard": item.securityName || "",
      Condition: item.condition || "Good",
      Status: item.isReturned ? "Returned" : "Active",
      "Expected Return": item.expectedReturnTime
        ? new Date(item.expectedReturnTime).toLocaleString()
        : "",
      Purpose: item.purpose || "",
      Notes: item.notes || "",
      "Reported to Manager": item.reportedToManager ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const filename = `${reportType}_report_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;
    saveAs(blob, filename);

    alert(`✅ Exported ${data.length} records successfully!`);
  };

  const exportToCSV = async () => {
    const data = await loadDataForExport();

    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Transaction #",
      "Date & Time",
      "Type",
      "Direction",
      "Equipment Name",
      "Quantity",
      "Brand",
      "Serial Number",
      "Description",
      "Guest/Staff Name",
      "Room/Department",
      "ID/Employee #",
      "Security Guard",
      "Condition",
      "Status",
      "Expected Return",
      "Purpose",
      "Notes",
      "Reported to Manager",
    ];

    const rows = data.map((item) => [
      item.transactionNumber || "",
      item.timestamp ? new Date(item.timestamp).toLocaleString() : "",
      item.transactionType === "guest_personal" ? "Guest" : "Company",
      item.direction === "IN" ? "IN" : "OUT",
      item.equipmentName || "",
      item.quantity || 1,
      item.brand || "",
      item.serialNumber || "",
      item.description || "",
      item.transactionType === "guest_personal"
        ? item.guestName || ""
        : item.staffName || "",
      item.transactionType === "guest_personal"
        ? item.roomNumber || ""
        : item.staffDepartment || "",
      item.transactionType === "guest_personal"
        ? item.guestId || ""
        : item.staffEmployeeId || "",
      item.securityName || "",
      item.condition || "Good",
      item.isReturned ? "Returned" : "Active",
      item.expectedReturnTime
        ? new Date(item.expectedReturnTime).toLocaleString()
        : "",
      item.purpose || "",
      item.notes || "",
      item.reportedToManager ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `${reportType}_report_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    saveAs(blob, filename);

    alert(`✅ Exported ${data.length} records successfully!`);
  };

  const handleExport = () => {
    if (exportFormat === "excel") {
      exportToExcel();
    } else {
      exportToCSV();
    }
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div style={styles.accessDenied}>
        <span style={styles.lockIcon}>🔒</span>
        <h2>Access Denied</h2>
        <p>This feature is only available for Administrators.</p>
        <p>Current Role: {user?.role || "Unknown"}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 Admin Reports & Export</h1>
        <p>Generate comprehensive reports and export data</p>
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.guestsInside || 0}</div>
            <div>🏨 Guests Inside</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.companyOut || 0}</div>
            <div>📦 Equipment Out</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.companyOverdue || 0}</div>
            <div>⚠️ Overdue</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {stats.guestsCheckedOutToday || 0}
            </div>
            <div>✅ Checked Out Today</div>
          </div>
        </div>
      )}

      {/* Export Controls */}
      <div style={styles.exportCard}>
        <h3>Export Configuration</h3>

        <div style={styles.formGroup}>
          <label>Report Type:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={styles.select}
          >
            <option value="all">📋 All Transactions</option>
            <option value="guests">🏨 Guest Equipment Only</option>
            <option value="company">📦 Company Equipment Only</option>
            <option value="overdue">⚠️ Overdue Equipment</option>
            <option value="checkins">⬅️ Check-Ins Only</option>
            <option value="checkouts">➡️ Check-Outs Only</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.select}
          >
            <option value="all">📅 All Time</option>
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
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        )}

        <div style={styles.formGroup}>
          <label>Export Format:</label>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="excel"
                checked={exportFormat === "excel"}
                onChange={(e) => setExportFormat(e.target.value)}
              />{" "}
              Excel (.xlsx)
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={(e) => setExportFormat(e.target.value)}
              />{" "}
              CSV (.csv)
            </label>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          style={styles.exportButton}
        >
          {loading ? "Loading Data..." : "📥 Generate & Export Report"}
        </button>
      </div>

      {/* Preview Section */}
      {previewData.length > 0 && (
        <div style={styles.previewCard}>
          <h3>Preview (First 10 records)</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Equipment</th>
                  <th>Person</th>
                  <th>Security</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td>
                      {item.transactionType === "guest_personal"
                        ? "🏨 Guest"
                        : "📦 Company"}
                    </td>
                    <td>{item.equipmentName}</td>
                    <td>
                      {item.transactionType === "guest_personal"
                        ? item.guestName
                        : item.staffName}
                    </td>
                    <td>{item.securityName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={styles.previewNote}>
            Full report will include all {previewData.length}+ records with
            complete details
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: "8px",
  },
  exportCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "white",
  },
  dateRange: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "20px",
  },
  dateInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
  exportButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  previewCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  previewNote: {
    marginTop: "15px",
    fontSize: "12px",
    color: "#666",
    textAlign: "center",
  },
  accessDenied: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#ffebee",
    borderRadius: "15px",
    margin: "40px auto",
    maxWidth: "500px",
  },
  lockIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "20px",
  },
};

export default AdminExportPanel;
