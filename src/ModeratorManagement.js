import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebaseConfig';
import {
    collection,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import './ModeratorManagement.css';


const ModeratorManagement = () => {
    const [moderators, setModerators] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

  
    const adminEmail = 'madhavjariwala55@gmail.com';

   
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(firestore, 'users'),
            (snapshot) => {
                const moderatorsData = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((user) => user.role === 'moderator');
                setModerators(moderatorsData);
            },
            (error) => console.error('Error fetching moderators:', error)
        );

        return () => unsubscribe();
    }, []);

  
    const checkIfAdmin = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return false;

        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        return userData && userData.role === 'admin';
    };

   
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

   
    const handleDemote = async (id) => {
        const isAdmin = await checkIfAdmin();
        if (!isAdmin) {
            alert('You are not authorized to demote moderators.');
            return;
        }

        try {
            await updateDoc(doc(firestore, 'users', id), { role: 'user' });
            alert('Moderator demoted successfully.');
        } catch (error) {
            console.error('Error demoting moderator:', error);
            alert('Failed to demote moderator.');
        }
    };

  
    const suspendUser = async (userId) => {
        const isAdmin = await checkIfAdmin();
        if (!isAdmin) {
            alert("You are not authorized to suspend users.");
            return;
        }
    
        try {
          
            await updateDoc(doc(firestore, "users", userId), { status: "suspended" });
            alert("Moderator suspended successfully!");
        } catch (error) {
            console.error("Error suspending user:", error);
            alert("Failed to suspend the user. Please try again.");
        }
    };

   
    const activateUser = async (userId) => {
        const isAdmin = await checkIfAdmin();
        if (!isAdmin) {
            alert("You are not authorized to activate users.");
            return;
        }
    
        try {
          
            await updateDoc(doc(firestore, "users", userId), { status: "active" });
            alert("Moderator activated successfully!");
        } catch (error) {
            console.error("Error activating user:", error);
            alert("Failed to activate the user. Please try again.");
        }
    };

   
    const handleDelete = async (id) => {
        const isAdmin = await checkIfAdmin();
        if (!isAdmin) {
            alert('You are not authorized to delete moderators.');
            return;
        }

        try {
            const isConfirmed = window.confirm('Are you sure you want to delete this moderator?');
            if (isConfirmed) {
                await deleteDoc(doc(firestore, 'users', id));
                alert('Moderator deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting moderator:', error);
            alert('Failed to delete moderator.');
        }
    };

   
    const filteredModerators = moderators.filter((moderator) => {
        const email = moderator.email || '';
        return email.toLowerCase().includes(searchQuery.toLowerCase().trim());
    });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
      };

    return (
        <div className="adminnnnnsmoderatormanagementpage">
            
           <header className="adminmodddreattnavbar">
        <h1 onClick={() => navigate('/AdminDashboard')}>Admin One</h1>
        <div className="navbar-right">
          <Link to="/AdminProfile" className="profile-link" style={{ color: "white" }}>Profile</Link>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

            <div className="adminmoddrrrrsidebar">
            <Link to="/AdminDashboard">Dashboard</Link>
                <Link to="/users">User Management</Link>
                <Link to="/ModeratorManagement" >
                    Moderator Management
                </Link>
                <Link to="/suspendedresources">Suspended Resources</Link>
                <Link to="/Admincontentmanagement">Content Management</Link>
                <Link to="/Adminsupport">Support Management</Link>
                <h4>
    <a href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules" target="_blank" rel="noopener noreferrer">
      Security Rules
    </a>
  </h4>
            </div>

            <div className="addminnmoderator-management-container">
                <h2 className="adminnmoddmoderator-management-title">Moderator Management</h2>
                <button className="btn btn-link" onClick={() => navigate('/AddModerator')}>Add a Moderator</button>
                <table className="adminnnssmoderator-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredModerators.length > 0 ? (
                            filteredModerators.map((moderator) => (
                                <tr key={moderator.id}>
                                    <td>{moderator.email}</td>
                                    <td>{moderator.status}</td>
                                    <td>
                                        <button id='demotebtn' onClick={() => handleDemote(moderator.id)}>Demote</button>
                                        {moderator.status !== "suspended" ? (
                                            <button id='suspendbtn' onClick={() => suspendUser(moderator.id)}>Suspend</button>
                                        ) : (
                                            <button id='activatebtn' onClick={() => activateUser(moderator.id)}>Activate</button>
                                        )}
                                        <button id='deletebtn' onClick={() => handleDelete(moderator.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No moderators found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="addmmiinnmmooddfooter">
        <ul className="addminnnmoddfooter-links">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
        </div>
    );
};

export default ModeratorManagement;
