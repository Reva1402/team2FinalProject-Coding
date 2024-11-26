import React, { useEffect, useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./AdminDashboard.css";


const AdminDashboard = () => {
  const [userCounts, setUserCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [moderatorCounts, setModeratorCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [eventCounts, setEventCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const adminEmail = "madhavjariwala55@gmail.com";

  useEffect(() => {

    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== adminEmail) {
      navigate("/login");
      return;
    }
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
      setModeratorCounts({ total: totalmoderators, active: activemoderators, inactive: inactivemoderators });
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

    if (query === "" || query.includes("user")) {
      sections.push(
        <div className="addashhh-management-section" key="users">
          <h2><Link to="/users">User Management</Link></h2>
          <div className="admindashcount-row">
            <div className="addmin-dash-count-box total">Total: {userCounts.total}</div>
            <div className="addmin-dash-count-box active">Active: {userCounts.active}</div>
            <div className="addmin-dash-count-box active">Inactive: {userCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || query.includes("moderator")) {
      sections.push(
        <div className="adddminashmanagementsection" key="moderators">
          <h2><Link to="/moderatormanagement">Moderators Management</Link></h2>
          <div className="admindashcount-row">
            <div className="addmin-dash-count-box total">Total: {moderatorCounts.total}</div>
            <div className="addmin-dash-count-box active">Active: {moderatorCounts.active}</div>
            <div className="addmin-dash-count-box inactive">Inactive: {moderatorCounts.inactive}</div>
          </div>
        </div>
      );
    }

    if (query === "" || query.includes("event")) {
      sections.push(
        <div className="addminnndashmanagementsection" key="events">
          <h2><Link to="/adminContentManagement">Events Management</Link></h2>
          <div className="admindashcount-row">
            <div className="addmin-dash-count-box total">Total: {eventCounts.total}</div>
            <div className="addmin-dash-count-box active">Active: {eventCounts.active}</div>
            <div className="addmin-dash-count-box inactive">Inactive: {eventCounts.inactive}</div>
          </div>
        </div>
      );
    }

    return sections;
  };

  return (
    <div className="add-admin-dashboard">
      <header className="adddasgnavbar">
        <h1>Welcome Admin</h1>
        <div className="admindashboard-navbar-right">
          <Link to="/AdminProfile" className="admindashboard-profile-link" style={{ color: "white" }}>Profile</Link>
          <button className="admindash-logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div className="admindash-content">
        <aside className="admindash-sidebar">
          <Link to="/AdminDashboard">Dashboard</Link>
          <Link to="/users">User Management</Link>
          <Link to="/moderatormanagement">Moderator Management</Link>
          <Link to="/suspendedresources">Suspended Resources</Link>
          <Link to="/Admincontentmanagement">Content Management</Link>
          <Link to="/Adminsupport">Support Management</Link>
          <h4>
            <a id="firebaselink" href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules" target="_blank" rel="noopener noreferrer">
              Security Rules
            </a>
          </h4>
        </aside>

        <div className="adminadd-dashboard-content">
          {filteredSections()}
        </div>
      </div>

      <footer className="admindashfooter">
        <ul className="admindashfooter-links">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
    </div>
  );
};

export default AdminDashboard;
