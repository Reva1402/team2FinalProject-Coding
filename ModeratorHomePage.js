import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc} from 'firebase/firestore';
import './ModeratorHomePage.css';

const ModeratorHomePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                navigate('/moderatorlogin');
                return;
            }

            // Verify if the user is a moderator
            try {
                const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                // Will add logic where we check if the user is a moderator
                if (!userDoc.exists()) {
                    navigate('/moderatorlogin');
                    return;
                }
                setUserName(userDoc.data().firstName || "Moderator");
            } catch (error) {
                console.error("Error verifying moderator status:", error);
                navigate('/moderatorlogin');
                return;
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="moderator-page">
            <nav className="moderator-navbar">
                <div className="nav-left">
                    <h1>Welcome {userName}</h1>
                </div>
                <div className="nav-right">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button className="profile-btn" onClick={() => navigate('/moderator/profile')}>
                        Profile
                    </button>
                </div>
            </nav>

            <div className="moderator-content">
                <aside className="sidebar">
                    <ul>
                        <li onClick={() => setActiveView('dashboard')}>Dashboard</li>
                        <li onClick={() => setActiveView('users')}>User Management</li>
                        <li onClick={() => setActiveView('events')}>Event Management</li>
                        <li onClick={() => setActiveView('comments')}>Comment Management</li>
                    </ul>
                </aside>
            </div>

            <footer className="moderator-footer">
                <p>About</p>
                <p>Privacy Policy</p>
                <p>Terms and Conditions</p>
                <p>Contact Us</p>
            </footer>
        </div>
    );
};

export default ModeratorHomePage; 