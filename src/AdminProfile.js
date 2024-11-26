import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import './AdminProfile.css';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const docRef = doc(firestore, 'users', uid);

          const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().role === 'admin') {
              setAdminData(docSnap.data());
            } else {
              console.error('Admin profile not found or user is not an admin.');
              setAdminData(null);
            }
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();

    return () => {};
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!adminData) return <div>No profile data available.</div>;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-profile-container">
      <header className="admin-profile-navbar">
        <h1>Welcome Admin</h1>
        <div className="admin-profile-navbar-right">
          <Link to="/AdminProfile" className="admin-profile-profile-link">
            Profile
          </Link>
          <button className="admin-profile-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <aside className="admin-profile-sidebar">
        <Link to="/AdminDashboard" className="admin-profile-sidebar-link">Dashboard</Link>
        <Link to="/users" className="admin-profile-sidebar-link">User Management</Link>
        <Link to="/moderatormanagement" className="admin-profile-sidebar-link">Moderator Management</Link>
        <Link to="/suspendedresources" className="admin-profile-sidebar-link">Suspended Resources</Link>
        <Link to="/Admincontentmanagement" className="admin-profile-sidebar-link">Content Management</Link>
        <Link to="/Adminsupport" className="admin-profile-sidebar-link">Support Management</Link>
        <h4>
          <a
            href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-profile-security-link"
          >
            Security Rules
          </a>
        </h4>
      </aside>

      <div className="admin-profile-card">
        {adminData.profilePicture && (
          <img
            src={adminData.profilePicture}
            alt="Admin Profile"
            className="admin-profile-picture"
          />
        )}
        <div className="admin-profile-info">
          <p><strong>Name:</strong> {adminData.firstName} {adminData.lastName}</p>
          <p><strong>Email:</strong> {adminData.email}</p>
          <p><strong>Mobile Number:</strong> {adminData.mobileNumber}</p>
          <p><strong>Address:</strong> {adminData.address}</p>
        </div>
        <div className="admin-profile-actions">
          <button
            className="admin-profile-edit-btn"
            onClick={() => navigate('/AdminEditProfile')}
          >
            Edit Profile
          </button>
        </div>
      </div>

      <footer className="admin-profile-footer">
        <ul className="admin-profile-footer-links">
          <li onClick={() => navigate('/about')} className="admin-profile-footer-link">About</li>
          <li onClick={() => navigate('/privacypolicy')} className="admin-profile-footer-link">Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')} className="admin-profile-footer-link">Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')} className="admin-profile-footer-link">Contact Us</li>
        </ul>
      </footer>
    </div>
  );
};

export default AdminProfile;
