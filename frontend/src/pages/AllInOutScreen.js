import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory, searchTransactions } from "../services/api";
import ExportButton from "../components/ExportButton";
import ExportModal from "../components/ExportModal";

function AllInOutScreen() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterDirection, setFilterDirection] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [page, filterType, filterDirection, dateFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let response;
      if (searchQuery) {
        response = await searchTransactions(searchQuery);
        let data = response.data;
        data = applyFilters(data);
        setTransactions(data);
        setTotalPages(1);
        setTotalRecords(data.length);
      } else {
        response = await getHistory(page, 100);
        let data = response.data.transactions;
        data = applyFilters(data);
        setTransactions(data);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = [...data];

    if (filterType === "guest") {
      filtered = filtered.filter((t) => t.transactionType === "guest_personal");
    } else if (filterType === "company") {
      filtered = filtered.filter(
        (t) => t.transactionType === "company_equipment",
      );
    }

    if (filterDirection === "in") {
      filtered = filtered.filter((t) => t.direction === "IN");
    } else if (filterDirection === "out") {
      filtered = filtered.filter((t) => t.direction === "OUT");
    }

    const now = new Date();
    if (dateFilter === "today") {
      const today = now.toDateString();
      filtered = filtered.filter(
        (t) => new Date(t.timestamp).toDateString() === today,
      );
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((t) => new Date(t.timestamp) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((t) => new Date(t.timestamp) >= monthAgo);
    }

    return filtered;
  };

  const loadAllForExport = async () => {
    try {
      const response = await getHistory(1, 10000);
      let data = response.data.transactions;
      data = applyFilters(data);
      setAllTransactions(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPage(1);
      loadTransactions();
      return;
    }

    setSearching(true);
    try {
      const response = await searchTransactions(searchQuery);
      let data = response.data;
      data = applyFilters(data);
      setTransactions(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSearching(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetFilters = () => {
    setFilterType("all");
    setFilterDirection("all");
    setDateFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  const getTypeInfo = (transaction) => {
    if (transaction.transactionType === "guest_personal") {
      return {
        icon: "🏨",
        text: "GUEST",
        color: "#2196f3",
        person: transaction.guestName,
        extra: `Room ${transaction.roomNumber}`,
      };
    }
    return {
      icon: "📦",
      text: "COMPANY",
      color: "#ff9800",
      person: transaction.staffName,
      extra: transaction.staffDepartment || "Staff",
    };
  };

  const getDirectionInfo = (direction) => {
    if (direction === "IN") return { text: "IN", color: "#4caf50", icon: "⬅️" };
    return { text: "OUT", color: "#f44336", icon: "➡️" };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.headerTitle}>📋 ALL CHECK-INS & CHECK-OUTS</h1>
        <div style={styles.headerActions}>
          <button
            onClick={() => {
              loadAllForExport();
              setShowExportModal(true);
            }}
            style={styles.exportBtn}
          >
            📊 Export All
          </button>
          <ExportButton
            data={transactions}
            filename="all_transactions"
            buttonText="📋 Export Current"
            buttonStyle={styles.quickExportBtn}
            icon="📋"
          />
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.statsBar}>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{transactions.length}</span>
            <span>Showing</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{totalRecords}</span>
            <span>Total Records</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>
              {transactions.filter((t) => t.direction === "IN").length}
            </span>
            <span>Check-Ins</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>
              {transactions.filter((t) => t.direction === "OUT").length}
            </span>
            <span>Check-Outs</span>
          </div>
        </div>

        <div style={styles.filtersCard}>
          <div style={styles.searchSection}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by equipment, person, room, or transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button style={styles.searchBtn} onClick={handleSearch}>
              🔍 Search
            </button>
          </div>
          <div style={styles.filterRow}>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="all">📋 All Types</option>
              <option value="guest">🏨 Guest Equipment</option>
              <option value="company">📦 Company Equipment</option>
            </select>
            <select
              value={filterDirection}
              onChange={(e) => {
                setFilterDirection(e.target.value);
                setPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="all">🔄 All Directions</option>
              <option value="in">⬅️ Check-Ins (IN)</option>
              <option value="out">➡️ Check-Outs (OUT)</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              style={styles.filterSelect}
            >
              <option value="all">📅 All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <button onClick={resetFilters} style={styles.resetBtn}>
              Reset Filters
            </button>
          </div>
        </div>

        {loading || searching ? (
          <div style={styles.loadingState}>
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p>No transactions found</p>
            <button onClick={resetFilters} style={styles.resetFiltersBtn}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Direction</th>
                  <th style={styles.th}>Equipment</th>
                  <th style={styles.th}>Person</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>Security</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => {
                  const typeInfo = getTypeInfo(item);
                  const directionInfo = getDirectionInfo(item.direction);
                  return (
                    <tr key={item._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        {formatDateTime(item.timestamp)}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            backgroundColor: typeInfo.color,
                          }}
                        >
                          {typeInfo.icon} {typeInfo.text}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.directionBadge,
                            backgroundColor: directionInfo.color,
                          }}
                        >
                          {directionInfo.icon} {directionInfo.text}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <strong>{item.equipmentName}</strong>
                        {item.quantity > 1 && (
                          <span style={styles.qtyBadge}>x{item.quantity}</span>
                        )}
                        {item.brand && (
                          <div style={styles.brandText}>{item.brand}</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div>
                          <strong>{typeInfo.person}</strong>
                        </div>
                        <div style={styles.extraText}>{typeInfo.extra}</div>
                      </td>
                      <td style={styles.td}>
                        {item.serialNumber && (
                          <div>SN: {item.serialNumber}</div>
                        )}
                        {item.purpose && <div>📋 {item.purpose}</div>}
                        {item.expectedReturnTime && (
                          <div style={styles.expectedText}>
                            Expected: {formatDateTime(item.expectedReturnTime)}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div>👮 {item.securityName}</div>
                        <div style={styles.timeText}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!searchQuery && totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              style={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={allTransactions}
          title="all_transactions"
        />
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    cursor: "pointer",
  },
  headerTitle: { margin: 0, fontSize: "20px" },
  headerActions: { display: "flex", gap: "10px" },
  exportBtn: {
    backgroundColor: "#4caf50",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    cursor: "pointer",
  },
  quickExportBtn: {
    backgroundColor: "#2196f3",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    cursor: "pointer",
  },
  content: { maxWidth: "1400px", margin: "0 auto", padding: "20px" },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  statBox: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  statNumber: {
    display: "block",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#667eea",
  },
  filtersCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  searchSection: { display: "flex", gap: "10px", marginBottom: "15px" },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
  },
  searchBtn: {
    padding: "12px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  filterRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  filterSelect: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  resetBtn: {
    padding: "10px 20px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  },
  loadingState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "15px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "15px",
  },
  emptyIcon: { fontSize: "64px", display: "block", marginBottom: "20px" },
  resetFiltersBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "15px",
    overflow: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e0e0e0",
  },
  th: { padding: "15px", textAlign: "left", fontWeight: "bold", color: "#333" },
  tableRow: { borderBottom: "1px solid #eee" },
  td: { padding: "12px 15px", verticalAlign: "top" },
  typeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    display: "inline-block",
  },
  directionBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    display: "inline-block",
  },
  qtyBadge: {
    backgroundColor: "#e0e0e0",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    marginLeft: "5px",
  },
  brandText: { fontSize: "11px", color: "#999", marginTop: "2px" },
  extraText: { fontSize: "11px", color: "#999", marginTop: "2px" },
  expectedText: { fontSize: "11px", color: "#ff9800", marginTop: "4px" },
  timeText: { fontSize: "10px", color: "#999", marginTop: "2px" },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginTop: "30px",
    padding: "20px",
  },
  pageBtn: {
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pageInfo: { fontSize: "14px", color: "#666" },
};

export default AllInOutScreen;
