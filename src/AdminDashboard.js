import React, { useEffect, useState } from "react";
import { firestore } from "./firebaseConfig"; 
import { Link, useNavigate } from "react-router-dom"; 
import { collection, onSnapshot } from "firebase/firestore"; 
import { auth } from "./firebaseConfig"; 
import { signOut } from "firebase/auth"; 
import "./Styling.css"; 

const AdminDashboard = () => {
  const [userCounts, setUserCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [moderatorCounts, setModeratorCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [eventCounts, setEventCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const navigate = useNavigate(); 

  
  useEffect(() => {
    const userListener = onSnapshot(collection(firestore, "users"), snapshot => {
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

  return (
    <div className="admin-dashboard">
      
      <header className="navbar">
        <h1> Welcome to the Admin Portal </h1>
        <nav>
          <Link to="/profile">Profile</Link>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </nav>
      </header>

      <div className="content">
        <aside className="sidebar">
          <Link to="/users">User Management</Link>
          <Link to="/content-management">Content Management</Link>
          <Link to="/moderator-management">Moderator Management</Link>
          <Link to="/event-management">Event Management</Link>
          <Link to="/system-changes">System Changes</Link>
        </aside>
        <main className="dashboard-content">
          <div className="section">
            <h2>User Management</h2>
            <div className="count-box total">Total: {userCounts.total}</div>
            <div className="count-box active">Active: {userCounts.active}</div>
            <div className="count-box inactive">Inactive: {userCounts.inactive}</div>
          </div>
          <div className="section">
            <h2>Moderator Management</h2>
            <div className="count-box total">Total: {moderatorCounts.total}</div>
            <div className="count-box active">Active: {moderatorCounts.active}</div>
            <div className="count-box inactive">Inactive: {moderatorCounts.inactive}</div>
          </div>
          <div className="section">
            <h2>Event Management</h2>
            <div className="count-box total">Total: {eventCounts.total}</div>
            <div className="count-box active">Active: {eventCounts.active}</div>
            <div className="count-box inactive">Inactive: {eventCounts.inactive}</div>
          </div>
        </main>
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

export default AdminDashboard;
