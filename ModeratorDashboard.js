import React, { useEffect, useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./Styling.css";

const ModeratorDashboard = () => {
  const [userCounts, setUserCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [moderatorCounts, setModeratorCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [eventCounts, setEventCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const navigate = useNavigate();

  useEffect(() => {
    const userListener = onSnapshot(collection(firestore, "user"), snapshot => {
      const total = snapshot.size;
      const active = snapshot.docs.filter(doc => doc.data().status === "active").length;
      const inactive = total - active;
      setUserCounts({ total, active, inactive });
    });

    const moderatorListener = onSnapshot(collection(firestore, "moderators"), snapshot => {
      const total = snapshot.size;
      const active = snapshot.docs.filter(doc => doc.data().status === "active").length;
      const inactive = total - active;
      setModeratorCounts({ total, active, inactive });
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
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle the change in search query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Function to filter sections based on search query
  const filteredSections = () => {
    const query = searchQuery.trim().toLowerCase();
    const sections = [];
    
    if (query === "" || "user".includes(query)) {
      sections.push(
        <div className="management-section" key="user">
          <h2><Link to="/ModeratorUserManagement">User Account</Link></h2>
          <div className="count-row">
            <div className="count-box total">Warnings: {userCounts.total}</div>
            <div className="count-box active">Remove: {userCounts.active}</div>
            <div className="count-box inactive">Suspension: {userCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || "moderator".includes(query)) {
      sections.push(
        <div className="management-section" key="moderators">
          <h2>Reported Events</h2>
          <div className="count-row">
            <div className="count-box total">Warnings: {moderatorCounts.total}</div>
            <div className="count-box active">Remove: {moderatorCounts.active}</div>
            <div className="count-box inactive">suspension: {moderatorCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || "event".includes(query)) {
      sections.push(
        <div className="management-section" key="events">
          <h2>Reported Comments</h2>
          <div className="count-row">
            <div className="count-box total">Warnings: {eventCounts.total}</div>
            <div className="count-box active">Remove: {eventCounts.active}</div>
            <div className="count-box inactive">suspension: {eventCounts.inactive}</div>
          </div>
        </div>
      );
    }

    return sections;
  };

  return (
    <div className="admin-dashboard">
      <header className="navbar">
        <h1>Moderator One</h1>
        <div className="navbar-right">
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            onChange={handleSearchChange}
            value={searchQuery}
          />
          <Link to="/profile" className="profile-link">Profile</Link>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <Link to="/moderatordashboard">Dashboard</Link>
          <Link to="/ModeratorUserManagement">User Management</Link>
          <Link to="/suspended-resources">Event Management</Link>
          <Link to="/content-management">Comment Management</Link>
         
        </aside>

        <div className="dashboard-content">
          {filteredSections()} {/* Render filtered sections */}
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

export default ModeratorDashboard;