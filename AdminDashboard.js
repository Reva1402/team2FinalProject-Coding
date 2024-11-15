import React, { useEffect, useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [userCounts, setUserCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [moderatorCounts, setModeratorCounts] = useState({ totalmoderators: 0, activemoderators: 0, inactivemoderators: 0 });
  const [eventCounts, setEventCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [searchQuery, setSearchQuery] = useState(""); 
  const navigate = useNavigate();
  const adminEmail = "madhavjariwala55@gmail.com";  // Admin's email

  useEffect(() => {
    // Check if the user is logged in and has the correct email
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== adminEmail) {
      // Redirect to login or another page if the email doesn't match
      navigate("/login");
      return; 
    }

    // Firestore listeners
    const userListener = onSnapshot(collection(firestore, "users"), snapshot => {
      const total = snapshot.size;
      const inactive = snapshot.docs.filter(doc => doc.data().status === "suspended").length;
      const active = total - inactive;
      setUserCounts({ total, active, inactive });
    });

    const moderatorListener = onSnapshot(collection(firestore, "users"), snapshot => {
      const totalmoderators = snapshot.docs.filter(doc => doc.data().role === "moderator").length;
      const activemoderators = snapshot.docs.filter(doc => doc.data().role === "moderator" && doc.data().status === "active").length;
      const inactivemoderators = totalmoderators - activemoderators;
      setModeratorCounts({ totalmoderators, activemoderators, inactivemoderators });
    });

    const eventListener = onSnapshot(collection(firestore, "events"), snapshot => {
      const total = snapshot.size;
      const active = snapshot.docs.filter(doc => doc.data().status === "active").length;
      const inactive = total - active;
      setEventCounts({ total, active, inactive });
    });

    return () => {
      userListener();
      moderatorListener();
      eventListener();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredSections = () => {
    const query = searchQuery.trim().toLowerCase();
    const sections = [];

    if (query === "" || "user".includes(query)) {
      sections.push(
        <div className="management-section" key="users">
          <h2><Link to="/usermanagement">User Management</Link></h2>
          <div className="count-row">
            <div className="count-box total">Total: {userCounts.total}</div>
            <div className="count-box active">Active: {userCounts.active}</div>
            <div className="count-box inactive">Inactive: {userCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || "moderator".includes(query)) {
      sections.push(
        <div className="management-section" key="moderators">
          <h2>Moderator Management</h2>
          <div className="count-row">
            <div className="count-box total">Total: {moderatorCounts.total}</div>
            <div className="count-box active">Active: {moderatorCounts.active}</div>
            <div className="count-box inactive">Inactive: {moderatorCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || "event".includes(query)) {
      sections.push(
        <div className="management-section" key="events">
          <h2>Event Management</h2>
          <div className="count-row">
            <div className="count-box total">Total: {eventCounts.total}</div>
            <div className="count-box active">Active: {eventCounts.active}</div>
            <div className="count-box inactive">Inactive: {eventCounts.inactive}</div>
          </div>
        </div>
      );
    }

    return sections;
  };

  return (
    <div className="admin-dashboard">
      <header className="navbar">
        <h1>Admin One</h1>
        <div className="navbar-right">
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            onChange={handleSearchChange}
            value={searchQuery}
          />
          <Link to="/AdminProfile" className="profile-link">Profile</Link>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <Link to="/users">User Management</Link>
          <Link to="/moderatormanagement">Moderator Management</Link>
          <Link to="/suspended-resources">Suspended Resources</Link>
          <Link to="/Admincontentmanagement">Content Management</Link>
          <Link to="/security-rules">Security Rules</Link>
        </aside>

        <div className="dashboard-content">
          {filteredSections()}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms and Conditions</Link>
          <Link to="/contact-us">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;