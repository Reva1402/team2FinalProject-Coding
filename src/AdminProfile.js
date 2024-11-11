import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './AdminProfile.css';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const docRef = doc(db, 'users', uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().role === "admin") {
            setAdminData(docSnap.data());
          } else {
            console.error('Admin profile not found or user is not an admin.');
          }
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [auth, db]);

  if (loading) return <div>Loading...</div>;
  if (!adminData) return <div>No profile data available.</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {adminData.profilepicture && (
          <img 
            src={adminData.profilepicture} 
            alt="Admin Profile" 
            className="profile-picture"
          />
        )}
        <div className="profile-info">
          <p><strong>Name:</strong> {adminData.firstName} {adminData.lastName}</p>
          <p><strong>Email:</strong> {adminData.email}</p>
          <p><strong>Mobile Number:</strong> {adminData.mobilenumber}</p>
          <p><strong>Address:</strong> {adminData.address}</p>
        </div>
        <div className="profile-actions">
          <button className="edit-btn" onClick={() => navigate('/editProfile')}>Edit Profile</button>
          <button className="delete-btn" onClick={() => navigate('/deleteProfile')}>Delete Profile</button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;