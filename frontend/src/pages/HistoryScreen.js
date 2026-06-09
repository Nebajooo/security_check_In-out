import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory, searchTransactions } from "../services/api";
import ExportButton from "../components/ExportButton";
import ExportModal from "../components/ExportModal";

function HistoryScreen() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState("all"); // all, guest, company
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [page, filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory(page, 50);
      let data = response.data.transactions;

      // Apply filter
      if (filter === "guest") {
        data = data.filter((t) => t.transactionType === "guest_personal");
      } else if (filter === "company") {
        data = data.filter((t) => t.transactionType === "company_equipment");
      }

      setTransactions(data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error loading history:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllTransactions = async () => {
    try {
      const response = await getHistory(1, 10000);
      let data = response.data.transactions;

      if (filter === "guest") {
        data = data.filter((t) => t.transactionType === "guest_personal");
      } else if (filter === "company") {
        data = data.filter((t) => t.transactionType === "company_equipment");
      }

      setAllTransactions(data);
    } catch (error) {
      console.error("Error loading all transactions:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadHistory();
      return;
    }

    setSearching(true);
    try {
      const response = await searchTransactions(searchQuery);
      let data = response.data;

      if (filter === "guest") {
        data = data.filter((t) => t.transactionType === "guest_personal");
      } else if (filter === "company") {
        data = data.filter((t) => t.transactionType === "company_equipment");
      }

      setTransactions(data);
    } catch (error) {
      console.error("Error searching:", error);
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

  const getStatusBadge = (transaction) => {
    if (transaction.direction === "IN") {
      return { text: "ENTERED", color: "#4caf50", icon: "⬅️" };
    }
    if (transaction.isReturned) {
      return { text: "RETURNED", color: "#4caf50", icon: "✅" };
    }
    if (
      transaction.transactionType === "guest_personal" &&
      transaction.direction === "IN"
    ) {
      return { text: "INSIDE HOTEL", color: "#2196f3", icon: "🏨" };
    }
    if (
      transaction.expectedReturnTime &&
      new Date(transaction.expectedReturnTime) < new Date()
    ) {
      return { text: "OVERDUE", color: "#f44336", icon: "⚠️" };
    }
    return { text: "OUT", color: "#ff9800", icon: "📤" };
  };

  const getPersonDisplay = (transaction) => {
    if (transaction.transactionType === "guest_personal") {
      return `${transaction.guestName} (Room ${transaction.roomNumber})`;
    }
    return `${transaction.staffName} (${transaction.staffDepartment || "Staff"})`;
  };

  const getTypeIcon = (type) => {
    return type === "guest_personal" ? "🏨" : "📦";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.headerTitle}>TRANSACTION HISTORY</h1>
        <div style={styles.headerActions}>
          <button onClick={() => navigate("/all")} style={styles.viewAllBtn}>
            📋 All In/Out
          </button>
          <button
            onClick={() => {
              loadAllTransactions();
              setShowExportModal(true);
            }}
            style={styles.exportBtn}
          >
            📊 Export All
          </button>
          <ExportButton
            data={transactions}
            filename="transaction_history"
            buttonText="📋 Export"
            buttonStyle={styles.quickExportBtn}
            icon="📋"
          />
        </div>
      </div>

      <div style={styles.content}>
        {/* Search and Filter */}
        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by equipment, person, room, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button style={styles.searchButton} onClick={handleSearch}>
              🔍 Search
            </button>
          </div>

          <div style={styles.filterButtons}>
            <button
              style={{
                ...styles.filterButton,
                ...(filter === "all" ? styles.filterActive : {}),
              }}
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
            >
              All
            </button>
            <button
              style={{
                ...styles.filterButton,
                ...(filter === "guest" ? styles.filterGuest : {}),
              }}
              onClick={() => {
                setFilter("guest");
                setPage(1);
              }}
            >
              🏨 Guests
            </button>
            <button
              style={{
                ...styles.filterButton,
                ...(filter === "company" ? styles.filterCompany : {}),
              }}
              onClick={() => {
                setFilter("company");
                setPage(1);
              }}
            >
              📦 Company
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div style={styles.resultsCount}>
          {searching
            ? "Searching..."
            : `Found ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
        </div>

        {/* Results List */}
        {loading || searching ? (
          <div style={styles.loadingState}>
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📜</span>
            <p>No transactions found</p>
            <button
              style={styles.resetButton}
              onClick={() => {
                setSearchQuery("");
                loadHistory();
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div style={styles.historyList}>
            {transactions.map((item) => {
              const status = getStatusBadge(item);
              return (
                <div key={item._id} style={styles.historyCard}>
                  <div style={styles.historyHeader}>
                    <div style={styles.transactionInfo}>
                      <span style={styles.typeIcon}>
                        {getTypeIcon(item.transactionType)}
                      </span>
                      <span style={styles.transactionNumber}>
                        #{item.transactionNumber}
                      </span>
                    </div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: status.color,
                      }}
                    >
                      {status.icon} {status.text}
                    </div>
                  </div>

                  <div style={styles.historyContent}>
                    <div style={styles.equipmentInfo}>
                      <strong style={styles.equipmentName}>
                        {item.equipmentName}
                      </strong>
                      {item.quantity > 1 && (
                        <span style={styles.quantityBadge}>
                          x{item.quantity}
                        </span>
                      )}
                      {item.brand && (
                        <span style={styles.brandText}> | {item.brand}</span>
                      )}
                    </div>

                    <div style={styles.personInfo}>
                      {item.transactionType === "guest_personal"
                        ? "👤 Guest: "
                        : "👔 Staff: "}
                      <strong>{getPersonDisplay(item)}</strong>
                      {item.roomNumber && (
                        <span style={styles.roomBadge}>
                          Room {item.roomNumber}
                        </span>
                      )}
                    </div>

                    <div style={styles.timeInfo}>
                      📅 {formatDateTime(item.timestamp)}
                      {item.direction === "OUT" && item.expectedReturnTime && (
                        <span style={styles.expectedTime}>
                          {" | Expected: "}
                          {formatDateTime(item.expectedReturnTime)}
                        </span>
                      )}
                    </div>

                    <div style={styles.securityInfo}>
                      👮 Processed by: <strong>{item.securityName}</strong>
                    </div>

                    {item.conditionOut && item.direction === "OUT" && (
                      <div style={styles.conditionInfo}>
                        📋 Condition out: {item.conditionOut}
                      </div>
                    )}

                    {item.conditionIn && (
                      <div style={styles.conditionInfo}>
                        📋 Condition in: {item.conditionIn}
                      </div>
                    )}

                    {item.purpose && (
                      <div style={styles.purposeInfo}>
                        💡 Purpose: {item.purpose}
                      </div>
                    )}

                    {item.reportedToManager && (
                      <div style={styles.reportedInfo}>
                        ⚠️ Reported to Manager on{" "}
                        {new Date(item.reportDate).toLocaleDateString()}
                      </div>
                    )}

                    {item.notes && (
                      <div style={styles.notesInfo}>📝 Notes: {item.notes}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!searchQuery && (
          <div style={styles.pagination}>
            <button
              style={styles.pageButton}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              style={styles.pageButton}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={allTransactions}
          title="transaction_history"
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    paddingBottom: "30px",
  },
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
    fontSize: "16px",
    cursor: "pointer",
  },
  headerTitle: {
    margin: 0,
    fontSize: "20px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  viewAllBtn: {
    backgroundColor: "#ff9800",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  exportBtn: {
    backgroundColor: "#4caf50",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  quickExportBtn: {
    backgroundColor: "#2196f3",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
  },
  controls: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  searchBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
  },
  searchButton: {
    padding: "12px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  filterButtons: {
    display: "flex",
    gap: "10px",
  },
  filterButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  filterActive: {
    backgroundColor: "#667eea",
    color: "white",
  },
  filterGuest: {
    backgroundColor: "#2196f3",
    color: "white",
  },
  filterCompany: {
    backgroundColor: "#ff9800",
    color: "white",
  },
  resultsCount: {
    padding: "10px",
    fontSize: "14px",
    color: "#666",
  },
  loadingState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "15px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "15px",
  },
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "20px",
  },
  resetButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  historyCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #e0e0e0",
  },
  transactionInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  typeIcon: {
    fontSize: "16px",
  },
  transactionNumber: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#666",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
    color: "white",
  },
  historyContent: {
    padding: "16px",
  },
  equipmentInfo: {
    marginBottom: "8px",
    fontSize: "16px",
  },
  equipmentName: {
    fontSize: "16px",
  },
  quantityBadge: {
    backgroundColor: "#e0e0e0",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "11px",
    marginLeft: "8px",
  },
  brandText: {
    fontSize: "13px",
    color: "#666",
  },
  personInfo: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "6px",
  },
  roomBadge: {
    backgroundColor: "#e3f2fd",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "11px",
    marginLeft: "8px",
    color: "#1976d2",
  },
  timeInfo: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "6px",
  },
  expectedTime: {
    color: "#ff9800",
  },
  securityInfo: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "6px",
  },
  conditionInfo: {
    fontSize: "12px",
    color: "#666",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px dashed #e0e0e0",
  },
  purposeInfo: {
    fontSize: "12px",
    color: "#666",
    marginTop: "6px",
    fontStyle: "italic",
  },
  reportedInfo: {
    fontSize: "12px",
    color: "#f44336",
    marginTop: "6px",
    fontWeight: "bold",
  },
  notesInfo: {
    fontSize: "12px",
    color: "#888",
    marginTop: "6px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginTop: "30px",
    padding: "20px",
  },
  pageButton: {
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pageInfo: {
    fontSize: "14px",
    color: "#666",
  },
};

export default HistoryScreen;
