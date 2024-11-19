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
  const [commentCounts, setCommentCounts] = useState({ total: 0, spam: 0, harassment: 0 });
  const [searchQuery, setSearchQuery] = useState(""); 
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

    const commentListener = onSnapshot(collection(firestore, "reports"), snapshot => {
      const total = snapshot.size;
      const spam = snapshot.docs.filter(doc => doc.data().reason === "spam").length;
      const harassment = snapshot.docs.filter(doc => doc.data().reason === "harassment").length;
      setCommentCounts({ total, spam, harassment });
    });

    return () => {
      userListener();
      moderatorListener();
      eventListener();
      commentListener();
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

   const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  
  const filteredSections = () => {
    const query = searchQuery.trim().toLowerCase();
    const sections = [];

   
    if (query === "" || query.includes("user")) {
      sections.push(
        <div className="management-section" key="reported-users">
          <h2><Link to="/ModeratorUserManagement">Reported Users</Link></h2>
          <div className="count-row">
            <div className="count-box total">Total Reports: {userCounts.total}</div>
            <div className="count-box active">Active: {userCounts.active}</div>
            <div className="count-box inactive">Inactive: {userCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || query.includes("event")) {
      sections.push(
        <div className="management-section" key="reported-events">
          <h2><Link to="/ModeratorEventManagement">Reported Events</Link></h2>
          <div className="count-row">
            <div className="count-box total">Total Reports: {eventCounts.total}</div>
            <div className="count-box active">Active: {eventCounts.active}</div>
            <div className="count-box inactive">Inactive: {eventCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || query.includes("comment")) {
      sections.push(
        <div className="management-section" key="reported-comments">
          <h2><Link to="/ModeratorCommentManagement">Reported Comments</Link></h2>
          <div className="count-row">
            <div className="count-box total">Total Reports: {commentCounts.total}</div>
            <div className="count-box spam">Spam: {commentCounts.spam}</div>
            <div className="count-box harassment">Harassment: {commentCounts.harassment}</div>
          </div>
        </div>
      );
    }

    return sections;
  };

  return (
    <div className="admin-dashboard">
      <nav className="moderator-navbar">
        <h2>Welcome, Moderator</h2>
        <input
          type="text"
          placeholder="Search sections..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button onClick={() => navigate('/ModeratorProfile')}>Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="content">
        <aside className="sidebar">
          <Link to="/moderatordashboard">Dashboard</Link>
          <Link to="/ModeratorHomePage">Feed</Link>
          <Link to="/ModeratorUserManagement">User Management</Link>
          <Link to="/ModeratorEventManagement">Event Management</Link>
          <Link to="/ModeratorCommentManagement">Comment Management</Link>
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

export default ModeratorDashboard;
