import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchGuestEquipment, guestCheckOut } from "../services/api";

function GuestCheckoutScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter guest name or room number");
      return;
    }

    setSearching(true);
    try {
      const response = await searchGuestEquipment(searchQuery);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        alert("No equipment found for this guest. Please verify.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for guest equipment");
    } finally {
      setSearching(false);
    }
  };

  const handleVerifyAndRelease = async (guest) => {
    if (
      !window.confirm(
        `Verify and release equipment for ${guest.guestName} (Room ${guest.roomNumber})?\n\nEquipment: ${guest.equipmentName} x${guest.quantity}\n\nThis will allow the guest to exit.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await guestCheckOut({ transactionId: guest._id });
      if (response.data.success) {
        alert(
          `✅ VERIFIED by ${currentUser.name}: ${guest.guestName} can exit with their equipment.`,
        );
        // Remove from list or refresh
        setSearchResults(searchResults.filter((g) => g._id !== guest._id));
        setSearchQuery("");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Verification failed";
      alert(
        `❌ REJECTED: ${errorMsg}\n\nGuest should not be allowed to exit with this equipment.`,
      );
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
        <h1>🚪 GUEST DEPARTURE</h1>
        <div style={{ width: "60px" }}></div>
      </div>

      <div style={styles.content}>
        <div style={styles.searchSection}>
          <h3>Verify Guest Equipment Before Exit</h3>
          <p style={styles.warning}>
            ⚠️ Guest must present their equipment for verification
          </p>

          <div style={styles.searchBox}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by guest name or room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              style={styles.searchButton}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? "Searching..." : "🔍 Search"}
            </button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div style={styles.resultsSection}>
            <h3>Guest Equipment Found</h3>
            <p style={styles.verifyText}>
              Verify each item before allowing exit:
            </p>

            {searchResults.map((guest) => (
              <div key={guest._id} style={styles.guestCard}>
                <div style={styles.guestHeader}>
                  <div>
                    <strong style={styles.guestName}>{guest.guestName}</strong>
                    <span style={styles.roomBadge}>
                      Room {guest.roomNumber}
                    </span>
                  </div>
                  <span style={styles.checkinTime}>
                    Checked in: {new Date(guest.timestamp).toLocaleString()}
                  </span>
                </div>

                <div style={styles.equipmentList}>
                  <div style={styles.equipmentItem}>
                    <span>📦 {guest.equipmentName}</span>
                    <span>x{guest.quantity}</span>
                    {guest.brand && (
                      <span style={styles.brandText}>{guest.brand}</span>
                    )}
                    {guest.serialNumber && (
                      <span style={styles.serialText}>
                        SN: {guest.serialNumber}
                      </span>
                    )}
                  </div>
                  {guest.description && (
                    <div style={styles.descriptionText}>
                      📝 {guest.description}
                    </div>
                  )}
                  <div style={styles.securityInfo}>
                    👮 Registered by: {guest.securityName}
                  </div>
                </div>

                <button
                  style={styles.verifyButton}
                  onClick={() => handleVerifyAndRelease(guest)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "✅ Verify & Allow Exit"}
                </button>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !searching && (
          <div style={styles.noResults}>
            <span style={styles.noResultsIcon}>🔍</span>
            <p>No equipment found for "{searchQuery}"</p>
            <p style={styles.noResultsHint}>
              Make sure the guest registered their equipment at check-in.
            </p>
          </div>
        )}

        <div style={styles.infoBox}>
          <h4>📋 Important:</h4>
          <ul style={styles.infoList}>
            <li>Guest must present ALL equipment they are taking out</li>
            <li>Compare equipment with registered items in the system</li>
            <li>If equipment doesn't match, DO NOT allow exit</li>
            <li>Report any discrepancies to manager immediately</li>
          </ul>
        </div>
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
  content: { maxWidth: "800px", margin: "0 auto", padding: "20px" },
  searchSection: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  warning: { color: "#f44336", fontSize: "14px", marginBottom: "15px" },
  searchBox: { display: "flex", gap: "10px" },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
  },
  searchButton: {
    padding: "12px 20px",
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  resultsSection: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  verifyText: { color: "#666", fontSize: "14px", marginBottom: "15px" },
  guestCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
  },
  guestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  guestName: { fontSize: "16px" },
  roomBadge: {
    background: "#2196f3",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    marginLeft: "10px",
  },
  checkinTime: { fontSize: "11px", color: "#999" },
  equipmentList: {
    background: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  equipmentItem: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    fontSize: "14px",
    flexWrap: "wrap",
  },
  brandText: { color: "#666", fontSize: "12px" },
  serialText: { color: "#999", fontSize: "11px", fontFamily: "monospace" },
  descriptionText: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
    paddingLeft: "10px",
  },
  securityInfo: {
    fontSize: "11px",
    color: "#999",
    marginTop: "5px",
    paddingLeft: "10px",
  },
  verifyButton: {
    width: "100%",
    padding: "12px",
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  noResults: {
    textAlign: "center",
    padding: "40px",
    background: "white",
    borderRadius: "15px",
  },
  noResultsIcon: { fontSize: "48px", display: "block", marginBottom: "10px" },
  noResultsHint: { fontSize: "12px", color: "#999", marginTop: "10px" },
  infoBox: {
    background: "#e3f2fd",
    borderRadius: "10px",
    padding: "15px",
    borderLeft: "4px solid #2196f3",
  },
  infoList: { margin: "10px 0 0 20px", lineHeight: "1.6" },
};

export default GuestCheckoutScreen;
