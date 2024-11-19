import React, { useEffect, useState } from "react";
import { firestore } from "./firebaseConfig";
import { collection, onSnapshot, updateDoc, deleteDoc, addDoc, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import "./UserManagement.css";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const adminEmail = "madhavjariwala55@gmail.com";  

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "users"), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => usersData.push({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      navigate("/login"); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const checkIfAdmin = () => {
    const currentUser = auth.currentUser;
    return currentUser && currentUser.email === adminEmail;
  };

  const changeUserRoleToModerator = async (userId) => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to change this user\'s role to moderator?');
      if (isConfirmed) {
        const user = auth.currentUser;
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        if (userData.role !== "admin") {
          alert("You are not authorized to change user roles.");
          return;
        }

        const targetUserDocRef = doc(firestore, "users", userId);
        await updateDoc(targetUserDocRef, { role: 'moderator' });
        alert("User role changed to moderator successfully!");
      }
    } catch (err) {
      console.error("Error changing role:", err);
      console.log("Changing role of user:",userId);
      alert(`Failed to change user role. Error: ${err.message}`);
    }
  };

  const suspendUser = async (userId) => {
    if (!checkIfAdmin()) {
      alert("You are not authorized to suspend users.");
      return;
    }

    try {
      await updateDoc(doc(firestore, "users", userId), { status: "suspended" });
      alert("User suspended successfully!");
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("Failed to suspend the user. Please try again.");
    }
  };

  const activateUser = async (userId) => {
    if (!checkIfAdmin()) {
      alert("You are not authorized to activate users.");
      return;
    }

    try {
      await updateDoc(doc(firestore, "users", userId), { status: "active" });
      alert("User activated successfully!");
    } catch (error) {
      console.error("Error activating user:", error);
      alert("Failed to activate the user. Please try again.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const viewUser = (userId) => {
    navigate(`/AdminModeratorUserProfile/${userId}`);
  };

  const deleteUser = async (userId) => {
    try {
      const isAdmin = await checkIfAdmin();
      if (!isAdmin) {
        alert("You are not authorized to delete users.");
        return;
      }

      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          alert("You cannot delete an admin user.");
          return;
        }
      }

      const isConfirmed = window.confirm("Are you sure you want to delete this user?");
      if (!isConfirmed) return;
      await deleteDoc(userDocRef);
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete the user. Please try again.");
    }
  };

 

  const filteredUsers = users.filter(user => {
    const username = user.username || "";
    const email = user.email || "";
    const query = searchQuery.toLowerCase().trim();
    return (
      user.role !== "moderator" &&  
      (username.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="admin-dashboard">
      <header className="navbar">
        <h1 onClick={() => navigate("/adminDashboard")}>Admin One</h1>
        <div className="navbar-right">
          <Link to="/AdminProfile" className="profile-link" style={{ color: "white" }}>Profile</Link>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div className="user-management-sidebar">
      <Link to="/AdminDashboard">Dashboard</Link>
        <Link to="/users">User Management</Link>
        <Link to="/ModeratorManagement">Moderator Management</Link>
        <Link to="/suspendedresources">Suspended Resources</Link>
        <Link to="/Admincontentmanagement">Content Management</Link>
        <Link to="/Adminsupport">Support Management</Link>
        <h4>
    <a href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules" target="_blank" rel="noopener noreferrer">
      Security Rules
    </a>
  </h4>
      </div>

      <div className="user-management">
        <button className="btn btn-link" onClick={() => navigate ("/AddUser")} >Add User</button>

        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>
                  <button onClick={() => viewUser(user.id)}>View</button>
                  <button onClick={() => changeUserRoleToModerator(user.id)}>Change Role to Moderator</button>
                  {user.status !== "suspended" ? (
                    <button onClick={() => suspendUser(user.id)}>Suspend</button>
                  ) : (
                    <button onClick={() => activateUser(user.id)}>Activate User</button>
                  )}
                  <button onClick={() => deleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="footer">
        <p>About</p>
        <p>Privacy Policy</p>
        <p>Terms and Conditions</p>
        <p>Contact Us</p>
      </footer>
    </div>
  );
};

export default UserManagement;
