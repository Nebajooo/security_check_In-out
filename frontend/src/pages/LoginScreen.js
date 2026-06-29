import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGuards, login } from "../services/api";

function LoginScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log("Loading users...");
      const response = await getGuards();
      console.log("Response received:", response);
      console.log("Users data:", response.data);

      if (response.data && response.data.length > 0) {
        setUsers(response.data);
        console.log(`✅ Loaded ${response.data.length} users`);
      } else {
        console.warn("⚠️ No users found in response");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      console.error("Error details:", error.response?.data);

      alert("Failed to load users. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    setError("");
    setPassword("");
  };

  const handleLogin = async () => {
    if (!password) {
      setError("Please enter password");
      return;
    }

    try {
      const response = await login(selectedUser.username, password);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid password. Please try again.");
    }
  };

  const getShiftIcon = (shift) => {
    if (shift.includes("Morning")) return "🌅";
    if (shift.includes("Afternoon")) return "☀️";
    if (shift.includes("Night")) return "🌙";
    return "👮";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.gradientBackground}>
        <div style={styles.content}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>🔐</div>
            <h1 style={styles.title}>Security Gate System</h1>
            <p style={styles.subtitle}>Equipment Check-In / Check-Out</p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Select Your Name</h2>
            <p style={styles.cardSubtitle}>Click on your name to login</p>

            <div style={styles.userList}>
              {users.map((user) => (
                <div
                  key={user._id}
                  style={styles.userCard}
                  onClick={() => handleUserSelect(user)}
                >
                  <div style={styles.userAvatar}>
                    {getShiftIcon(user.shift)}
                  </div>
                  <div style={styles.userInfo}>
                    <h3 style={styles.userName}>{user.name}</h3>
                    <p style={styles.userShift}>{user.shift}</p>
                  </div>
                  <div style={styles.arrowIcon}>→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowPasswordModal(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Enter Password</h3>
            <p style={styles.modalSubtitle}>
              User: <strong>{selectedUser?.name}</strong>
            </p>
            <input
              type="password"
              style={styles.passwordInput}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
            {error && <p style={styles.errorText}>{error}</p>}
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button style={styles.loginButton} onClick={handleLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  gradientBackground: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  content: { maxWidth: "500px", margin: "0 auto" },
  header: { textAlign: "center", padding: "40px 20px" },
  iconContainer: { fontSize: "64px", marginBottom: "20px" },
  title: {
    color: "white",
    fontSize: "28px",
    margin: "10px 0",
    fontWeight: "bold",
  },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: "16px" },
  card: {
    backgroundColor: "white",
    borderRadius: "30px",
    padding: "30px 20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    textAlign: "center",
    color: "#667eea",
    fontSize: "22px",
    marginBottom: "8px",
  },
  cardSubtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    marginBottom: "30px",
  },
  userList: { display: "flex", flexDirection: "column", gap: "12px" },
  userCard: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    border: "1px solid #e0e0e0",
    borderRadius: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  userAvatar: {
    fontSize: "30px",
    width: "60px",
    height: "60px",
    backgroundColor: "#f0f0ff",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "15px",
  },
  userInfo: { flex: 1 },
  userName: { margin: 0, fontSize: "18px", fontWeight: "bold", color: "#333" },
  userShift: { margin: "5px 0 0", fontSize: "14px", color: "#666" },
  arrowIcon: { fontSize: "20px", color: "#999" },
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
    borderRadius: "20px",
    padding: "30px",
    width: "90%",
    maxWidth: "400px",
  },
  modalTitle: { margin: "0 0 10px", fontSize: "24px", textAlign: "center" },
  modalSubtitle: { textAlign: "center", color: "#666", marginBottom: "20px" },
  passwordInput: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center",
  },
  modalButtons: { display: "flex", gap: "10px" },
  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
  },
  loginButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
};

export default LoginScreen;
