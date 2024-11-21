import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebaseConfig';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import './ModeratorUserManagement.css';
import './Header.css';
import './Footer.css';

const ModeratorUserManagement = () => {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportedUsers();
  }, []);


  const fetchReportedUsers = async () => {
    try {
      const reportsRef = collection(firestore, 'reports');
      const reportsSnapshot = await getDocs(reportsRef);

      const reportedUserIds = reportsSnapshot.docs
        .map(doc => doc.data())
        .reduce((acc, report) => {

          if (report.eventCreator) acc.push(report.eventCreator);

          if (report.commenterId) acc.push(report.commenterId);
          return acc;
        }, []);


      const uniqueReportedUserIds = [...new Set(reportedUserIds)];
      fetchUserNames(uniqueReportedUserIds);
    } catch (error) {
      console.error('Error fetching reported users:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      navigate("/login"); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const fetchUserNames = async (userIds) => {
    try {
      const usersRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const usersData = usersSnapshot.docs.reduce((acc, doc) => {
        const userData = doc.data();
        acc[doc.id] = {
          firstName: userData.firstName || 'Unknown',
          status: userData.status || 'active',
        };
        return acc;
      }, {});


      const updatedReportedUsers = userIds.map(userId => ({
        userId,
        firstName: usersData[userId]?.firstName || 'Unknown',
        status: usersData[userId]?.status || 'active',
      }));

      setReportedUsers(updatedReportedUsers);
    } catch (error) {
      console.error('Error fetching user names:', error);
    }
  };


  const suspendUser = async (userId) => {
    try {
      await updateDoc(doc(firestore, "users", userId), { status: "suspended" });
      alert("User suspended successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("Failed to suspend the user. Please try again.");
    }
  };


  const activateUser = async (userId) => {
    try {
      await updateDoc(doc(firestore, "users", userId), { status: "active" });
      await updateDoc(doc(firestore, "warnings", userId), { warnings: 0 });
      alert("User activated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error activating user:", error);
      alert("Failed to activate the user. Please try again.");
    }
  };

  const viewUser = (userId) => {
    navigate(`/AdminModeratorUserProfile/${userId}`);
  };




  const issueWarning = async (userId) => {
    try {

      const warningRef = doc(firestore, 'warnings', userId);


      const warningSnapshot = await getDoc(warningRef);

      if (warningSnapshot.exists()) {

        const currentWarnings = warningSnapshot.data().warnings || 0;


        if (currentWarnings >= 3) {
          await suspendUser(userId);
          return;
        }


        await updateDoc(warningRef, { warnings: increment(1), timestamp: serverTimestamp() });

      } else {

        await setDoc(warningRef, { warnings: 1 });
      }

      alert('Warning has been issued to the user.');
    } catch (error) {
      console.error('Error issuing warning:', error);
    }
  };


  return (
    <div className="moderator-user-management">
    <div className="moderator-management-container">
      <h2>Reported Users</h2>
      <nav className="navbar">
        <h2>Welcome</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
                <div className="moderator-button-container">
        <button className="moderator-profile-button" onClick={() => navigate('/ModeratorProfile')}>Profile</button>
        <button className="moderator-logout-button" onClick={handleLogout}>Logout</button>
        </div>
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

      <table className="moderator-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reportedUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.firstName}</td>
              <td className="action-buttons">
                <button className="view-button" onClick={() => viewUser(user.userId)}>View</button>
                {user.status !== "suspended" ? (
                  <button className="suspend-button" onClick={() => suspendUser(user.userId)}>Suspend</button>
                ) : (
                  <button className="activate-button" onClick={() => activateUser(user.userId)}>Activate User</button>
                )}
                <button className="warning-button" onClick={() => issueWarning(user.userId)}>Issue Warning</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <footer className="footer">
      
            <ul className="footer-links">
              <li onClick={() => navigate('/about')}>About</li>
              <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
              <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
              <li onClick={() => navigate('/contactus')}>Contact Us</li>
            </ul>
          </footer>

    </div>
  );
};

export default ModeratorUserManagement;
