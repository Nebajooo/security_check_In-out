import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStatistics,
  getActiveGuests,
  getActiveCompanyEquipment,
  getOverdueCompanyEquipment,
  getRecentActivity,
  getTodayCheckins,
  getTodayCheckouts,
  reportToManager,
} from "../services/api";
import ExportButton from "../components/ExportButton";
import ExportModal from "../components/ExportModal";

function DashboardScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    guestsInside: 0,
    guestsCheckedOutToday: 0,
    companyOut: 0,
    companyOverdue: 0,
    companyReturnedToday: 0,
  });
  const [activeGuests, setActiveGuests] = useState([]);
  const [activeCompany, setActiveCompany] = useState([]);
  const [overdueCompany, setOverdueCompany] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [todayCheckouts, setTodayCheckouts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [
        statsRes,
        guestsRes,
        companyRes,
        overdueRes,
        activityRes,
        checkinsRes,
        checkoutsRes,
      ] = await Promise.all([
        getStatistics(),
        getActiveGuests(),
        getActiveCompanyEquipment(),
        getOverdueCompanyEquipment(),
        getRecentActivity(),
        getTodayCheckins(),
        getTodayCheckouts(),
      ]);

      setStats(statsRes.data);
      setActiveGuests(guestsRes.data);
      setActiveCompany(companyRes.data);
      setOverdueCompany(overdueRes.data);
      setRecentActivity(activityRes.data);
      setTodayCheckins(checkinsRes.data);
      setTodayCheckouts(checkoutsRes.data);

      // Prepare all transactions for export
      const allTrans = [
        ...checkinsRes.data,
        ...checkoutsRes.data,
        ...activityRes.data,
      ];
      setAllTransactions([
        ...new Map(allTrans.map((item) => [item._id, item])).values(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleReportToManager = async (transactionId) => {
    if (window.confirm("Report this overdue equipment to manager?")) {
      try {
        await reportToManager({ transactionId });
        alert("Reported to manager successfully!");
        loadData();
      } catch (error) {
        alert(
          "Error reporting: " + (error.response?.data?.error || error.message),
        );
      }
    }
  };

  const getPersonIcon = (type) => {
    return type === "guest_personal" ? "🏨" : "👔";
  };

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning Shift";
    if (hour < 18) return "Afternoon Shift";
    return "Night Shift";
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Security Gate System</h1>
          <p style={styles.headerSubtitle}>
            Welcome, {user?.name} | {user?.shift} | {getCurrentShift()}
          </p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.securityBadge}>👮 {user?.name}</span>
          <button onClick={() => navigate("/all")} style={styles.viewAllBtn}>
            📋 All In/Out
          </button>
          <button
            onClick={() => {
              loadData();
              setShowExportModal(true);
            }}
            style={styles.exportBtn}
          >
            📊 Export
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Quick Summary Buttons */}
      <div style={styles.summaryButtons}>
        <button
          style={{
            ...styles.summaryBtn,
            ...(activeTab === "overview" ? styles.activeBtn : {}),
          }}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          style={{
            ...styles.summaryBtn,
            ...(activeTab === "checkins" ? styles.activeBtn : {}),
          }}
          onClick={() => setActiveTab("checkins")}
        >
          📥 Today's Check-Ins ({todayCheckins.length})
        </button>
        <button
          style={{
            ...styles.summaryBtn,
            ...(activeTab === "checkouts" ? styles.activeBtn : {}),
          }}
          onClick={() => setActiveTab("checkouts")}
        >
          📤 Today's Check-Outs ({todayCheckouts.length})
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderTop: "4px solid #2196f3" }}>
          <div style={styles.statValue}>{stats.guestsInside}</div>
          <div style={styles.statLabel}>🏨 Guests Inside Hotel</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #4caf50" }}>
          <div style={styles.statValue}>{stats.guestsCheckedOutToday}</div>
          <div style={styles.statLabel}>✅ Guests Checked Out Today</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #ff9800" }}>
          <div style={styles.statValue}>{stats.companyOut}</div>
          <div style={styles.statLabel}>📦 Company Equipment Out</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #f44336" }}>
          <div style={styles.statValue}>{stats.companyOverdue}</div>
          <div style={styles.statLabel}>⚠️ Overdue Returns</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          style={styles.guestInBtn}
          onClick={() => navigate("/guest/checkin")}
        >
          🏨 GUEST ARRIVAL
          <br />
          <small>Register Equipment</small>
        </button>
        <button
          style={styles.guestOutBtn}
          onClick={() => navigate("/guest/checkout")}
        >
          🚪 GUEST DEPARTURE
          <br />
          <small>Verify Equipment</small>
        </button>
        <button
          style={styles.companyOutBtn}
          onClick={() => navigate("/company/out")}
        >
          📤 STAFF TAKING OUT
          <br />
          <small>Register Company Equipment</small>
        </button>
        <button
          style={styles.companyInBtn}
          onClick={() => navigate("/company/in")}
        >
          📥 STAFF RETURNING
          <br />
          <small>Check Equipment Back In</small>
        </button>
      </div>

      {/* Dynamic Content Based on Tab */}
      {activeTab === "overview" && (
        <>
          {/* Overdue Alert */}
          {overdueCompany.length > 0 && (
            <div style={styles.overdueAlert}>
              <div style={styles.overdueHeader}>
                ⚠️ OVERDUE COMPANY EQUIPMENT
              </div>
              {overdueCompany.map((item) => (
                <div key={item._id} style={styles.overdueItem}>
                  <div style={{ flex: 1 }}>
                    <strong>{item.equipmentName}</strong> - {item.staffName} (
                    {item.staffDepartment})
                    <div style={styles.overdueDate}>
                      Due: {new Date(item.expectedReturnTime).toLocaleString()}
                    </div>
                    <div style={styles.securityInfoSmall}>
                      👮 Checked out by: {item.securityName}
                    </div>
                  </div>
                  {!item.reportedToManager && (
                    <button
                      style={styles.reportBtn}
                      onClick={() => handleReportToManager(item._id)}
                    >
                      📢 Report
                    </button>
                  )}
                  {item.reportedToManager && (
                    <span style={styles.reportedBadge}>✓ Reported</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Active Guests */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3>🏨 Guests Currently in Hotel ({activeGuests.length})</h3>
              <ExportButton
                data={activeGuests}
                filename="active_guests"
                buttonText="Export"
                buttonStyle={styles.sectionExportBtn}
                icon="📋"
              />
            </div>
            {activeGuests.length === 0 ? (
              <div style={styles.emptySection}>
                No guests with equipment inside
              </div>
            ) : (
              activeGuests.slice(0, 10).map((item) => (
                <div key={item._id} style={styles.listItem}>
                  <div>
                    <strong>{item.guestName}</strong> - Room {item.roomNumber}
                    <div style={styles.smallText}>
                      {item.equipmentName} x{item.quantity}
                      {item.brand && ` | ${item.brand}`}
                    </div>
                    <div style={styles.securityInfoSmall}>
                      👮 Registered by: {item.securityName}
                    </div>
                  </div>
                  <small>{new Date(item.timestamp).toLocaleTimeString()}</small>
                </div>
              ))
            )}
            {activeGuests.length > 10 && (
              <div style={styles.viewMore}>
                <button
                  onClick={() => navigate("/all")}
                  style={styles.viewAllLink}
                >
                  View all {activeGuests.length} guests →
                </button>
              </div>
            )}
          </div>

          {/* Active Company Equipment */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3>
                📦 Company Equipment Currently Out ({activeCompany.length})
              </h3>
              <ExportButton
                data={activeCompany}
                filename="active_company_equipment"
                buttonText="Export"
                buttonStyle={styles.sectionExportBtn}
                icon="📋"
              />
            </div>
            {activeCompany.length === 0 ? (
              <div style={styles.emptySection}>No company equipment out</div>
            ) : (
              activeCompany.slice(0, 10).map((item) => {
                const isOverdue =
                  new Date(item.expectedReturnTime) < new Date();
                return (
                  <div key={item._id} style={styles.listItem}>
                    <div>
                      <strong>{item.equipmentName}</strong> - {item.staffName} (
                      {item.staffDepartment})
                      <div style={styles.smallText}>
                        Expected:{" "}
                        {new Date(item.expectedReturnTime).toLocaleString()}
                        {isOverdue && (
                          <span style={styles.overdueText}> OVERDUE</span>
                        )}
                      </div>
                      <div style={styles.securityInfoSmall}>
                        👮 Checked out by: {item.securityName}
                      </div>
                    </div>
                    <small>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                );
              })
            )}
            {activeCompany.length > 10 && (
              <div style={styles.viewMore}>
                <button
                  onClick={() => navigate("/all")}
                  style={styles.viewAllLink}
                >
                  View all {activeCompany.length} items →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "checkins" && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>📥 Today's Check-Ins ({todayCheckins.length})</h3>
            <ExportButton
              data={todayCheckins}
              filename="today_checkins"
              buttonText="Export"
              buttonStyle={styles.sectionExportBtn}
              icon="📋"
            />
          </div>
          {todayCheckins.length === 0 ? (
            <div style={styles.emptySection}>No check-ins recorded today</div>
          ) : (
            todayCheckins.map((item) => (
              <div key={item._id} style={styles.activityItem}>
                <span
                  style={{
                    ...styles.typeBadge,
                    backgroundColor:
                      item.transactionType === "guest_personal"
                        ? "#2196f3"
                        : "#ff9800",
                  }}
                >
                  {getPersonIcon(item.transactionType)}{" "}
                  {item.transactionType === "guest_personal"
                    ? "GUEST"
                    : "COMPANY"}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{item.equipmentName}</strong> x{item.quantity}
                  <div style={styles.smallText}>
                    {item.transactionType === "guest_personal"
                      ? `${item.guestName} (Room ${item.roomNumber})`
                      : `${item.staffName} (${item.staffDepartment || "Staff"}) - Returning`}
                  </div>
                  <div style={styles.securityInfoSmall}>
                    👮 Processed by: {item.securityName}
                  </div>
                </div>
                <small>{new Date(item.timestamp).toLocaleTimeString()}</small>
              </div>
            ))
          )}
          {todayCheckins.length > 10 && (
            <div style={styles.viewMore}>
              <button
                onClick={() => navigate("/all")}
                style={styles.viewAllLink}
              >
                View all {todayCheckins.length} check-ins →
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "checkouts" && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>📤 Today's Check-Outs ({todayCheckouts.length})</h3>
            <ExportButton
              data={todayCheckouts}
              filename="today_checkouts"
              buttonText="Export"
              buttonStyle={styles.sectionExportBtn}
              icon="📋"
            />
          </div>
          {todayCheckouts.length === 0 ? (
            <div style={styles.emptySection}>No check-outs recorded today</div>
          ) : (
            todayCheckouts.map((item) => (
              <div key={item._id} style={styles.activityItem}>
                <span
                  style={{
                    ...styles.typeBadge,
                    backgroundColor:
                      item.transactionType === "guest_personal"
                        ? "#4caf50"
                        : "#ff9800",
                  }}
                >
                  {getPersonIcon(item.transactionType)}{" "}
                  {item.transactionType === "guest_personal"
                    ? "GUEST"
                    : "COMPANY"}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{item.equipmentName}</strong> x{item.quantity}
                  <div style={styles.smallText}>
                    {item.transactionType === "guest_personal"
                      ? `${item.guestName} (Room ${item.roomNumber}) - Departing`
                      : `${item.staffName} (${item.staffDepartment || "Staff"}) - Taking Out`}
                  </div>
                  <div style={styles.securityInfoSmall}>
                    👮 Processed by: {item.securityName}
                  </div>
                </div>
                <small>{new Date(item.timestamp).toLocaleTimeString()}</small>
              </div>
            ))
          )}
          {todayCheckouts.length > 10 && (
            <div style={styles.viewMore}>
              <button
                onClick={() => navigate("/all")}
                style={styles.viewAllLink}
              >
                View all {todayCheckouts.length} check-outs →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Footer */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3>🔄 Recent Activity (Last 50 transactions)</h3>
          <button onClick={() => navigate("/all")} style={styles.viewAllBtn}>
            View All →
          </button>
        </div>
        {recentActivity.slice(0, 15).map((item) => (
          <div key={item._id} style={styles.activityItem}>
            <span
              style={{
                ...styles.activityBadge,
                backgroundColor:
                  item.transactionType === "guest_personal"
                    ? "#2196f3"
                    : "#ff9800",
              }}
            >
              {item.transactionType === "guest_personal" ? "🏨" : "📦"}
            </span>
            <span
              style={{
                ...styles.directionBadge,
                backgroundColor:
                  item.direction === "IN" ? "#4caf50" : "#f44336",
              }}
            >
              {item.direction === "IN" ? "IN" : "OUT"}
            </span>
            <span style={{ flex: 1 }}>
              {item.transactionType === "guest_personal"
                ? `${item.guestName} - ${item.equipmentName}`
                : `${item.staffName} - ${item.equipmentName}`}
            </span>
            <div style={styles.securityColumn}>
              <span style={styles.securitySmall}>👮 {item.securityName}</span>
              <small>{new Date(item.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={allTransactions}
          title="dashboard_transactions"
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
    gap: "15px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "24px",
  },
  headerSubtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    opacity: 0.9,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  securityBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
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
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  summaryButtons: {
    display: "flex",
    gap: "10px",
    padding: "20px",
    backgroundColor: "white",
    margin: "0 20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginTop: "20px",
  },
  summaryBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    color: "#333",
    transition: "all 0.3s",
  },
  activeBtn: {
    backgroundColor: "#667eea",
    color: "white",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    padding: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },
  statLabel: {
    fontSize: "13px",
    color: "#666",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    padding: "0 20px 20px",
  },
  guestInBtn: {
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  guestOutBtn: {
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  companyOutBtn: {
    backgroundColor: "#ff9800",
    color: "white",
    border: "none",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  companyInBtn: {
    backgroundColor: "#9c27b0",
    color: "white",
    border: "none",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  section: {
    backgroundColor: "white",
    margin: "20px",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f0f0f0",
    flexWrap: "wrap",
    gap: "10px",
  },
  sectionExportBtn: {
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
  },
  emptySection: {
    textAlign: "center",
    padding: "30px",
    color: "#999",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
  smallText: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  securityInfoSmall: {
    fontSize: "11px",
    color: "#999",
    marginTop: "4px",
  },
  overdueText: {
    color: "#f44336",
    fontWeight: "bold",
    marginLeft: "5px",
  },
  viewMore: {
    textAlign: "center",
    marginTop: "15px",
    paddingTop: "10px",
  },
  viewAllLink: {
    backgroundColor: "transparent",
    color: "#667eea",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    flexWrap: "wrap",
  },
  activityBadge: {
    padding: "4px 8px",
    borderRadius: "8px",
    color: "white",
    fontSize: "12px",
    minWidth: "45px",
    textAlign: "center",
  },
  directionBadge: {
    padding: "2px 6px",
    borderRadius: "4px",
    color: "white",
    fontSize: "10px",
    minWidth: "35px",
    textAlign: "center",
  },
  typeBadge: {
    padding: "4px 8px",
    borderRadius: "8px",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    minWidth: "70px",
    textAlign: "center",
  },
  securityColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
  },
  securitySmall: {
    fontSize: "10px",
    color: "#666",
  },
  overdueAlert: {
    backgroundColor: "#ffebee",
    margin: "0 20px 20px",
    padding: "15px",
    borderRadius: "10px",
    borderLeft: "4px solid #f44336",
  },
  overdueHeader: {
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#c62828",
  },
  overdueItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #ffcdd2",
    flexWrap: "wrap",
    gap: "10px",
  },
  overdueDate: {
    fontSize: "11px",
    color: "#f44336",
    marginTop: "4px",
  },
  reportBtn: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "11px",
  },
  reportedBadge: {
    backgroundColor: "#4caf50",
    color: "white",
    padding: "3px 8px",
    borderRadius: "5px",
    fontSize: "11px",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "20px",
  },
};

export default DashboardScreen;
