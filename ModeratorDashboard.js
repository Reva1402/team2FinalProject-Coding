import React, { useEffect, useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./ModeratorDashboard.css";


const ModeratorDashboard = () => {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [reportedEvents, setReportedEvents] = useState([]);
  const [reportedComments, setReportedComments] = useState({ total: 0, spam: 0, harassment: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    
    const reportsListener = onSnapshot(collection(firestore, "reports"), async (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data());
      
      
      const userReports = [];
      const eventReports = [];
      const commentReports = { total: 0, spam: 0, harassment: 0 };

      for (const report of reports) {
        const { eventId, reporterId, reason } = report;
        
        
        const userDoc = await getDoc(doc(firestore, "users", reporterId));
        if (userDoc.exists()) {
          userReports.push(report);
        }

        
        const eventDoc = await getDoc(doc(firestore, "events", eventId));
        if (eventDoc.exists()) {
          eventReports.push(report);
        }

        
        if (reason === "spam" || reason === "harassment") {
          commentReports.total += 1;
          if (reason === "spam") {
            commentReports.spam += 1;
          } else if (reason === "harassment") {
            commentReports.harassment += 1;
          }
        }
      }

      setReportedUsers(userReports);
      setReportedEvents(eventReports);
      setReportedComments(commentReports);
    });

    return () => {
      reportsListener();
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
        <div className="modmanagementsection" key="reported-users">
          <h2><Link to="/ModeratorUserManagement">Reported Users</Link></h2>
          <div className="modddddasssscount-row">
            <div className="modddasscount-box total">Total Reports: {reportedUsers.length}</div>
            
          </div>
        </div>
      );
    }

    if (query === "" || query.includes("event")) {
      sections.push(
        <div className="modddasshmanagementsection" key="reported-events">
          <h2><Link to="/ModeratorEventManagement">Reported Events</Link></h2>
          <div className="modddddasssscount-row">
            <div className="modddasscount-box total">Total Reports: {reportedEvents.length}</div>
            
          </div>
        </div>
      );
    }

    if (query === "" || query.includes("comment")) {
      sections.push(
        <div className="modddassmanagement-section" key="reported-comments">
          <h2><Link to="/ModeratorCommentManagement">Reported Comments</Link></h2>
          <div className="modddddasssscount-row">
            <div className="moddasscount-box total">Total Reports: {reportedComments.total}</div>
            <div className="moddasscount-box spam">Spam: {reportedComments.spam}</div>
            <div className="moddasscount-box harassment">Harass: {reportedComments.harassment}</div>
          </div>
        </div>
      );
    }

    return sections;
  };

  return (
    <div className="moderatordass-management-container">
      <nav className="moderator-navbar">
                <h2>Welcome, Moderator</h2>
                
                <button className="profile-button" onClick={() => navigate('/ModeratorProfile')}>Profile</button>
                <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
            </nav>

            <div>
                <aside className="sidebar">
                    <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorHomePage">Feed</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>
            </div>

        <div className="modddassdashboard-content">
          {filteredSections()}
        </div>
      

   
      <footer className="modeartordassssfooter">
        <ul className="modeartordassssfooterlinks">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
    </div>
  );
};

export default ModeratorDashboard;
