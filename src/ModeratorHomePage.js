import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import './ModeratorHomePage.css';

const ModeratorHomePage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
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

            // Fetch events
            fetchEvents();
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, 'events');
            const eventSnapshot = await getDocs(eventsRef);
            const eventList = eventSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventList);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/moderatorlogin');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const filterEvents = () => {
        if (!searchQuery.trim()) return events;
        return events.filter(event =>
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderEventManagementTable = () => {
        return (
            <div className="event-management-table">
                <h2>Events</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterEvents().map(event => (
                            <tr key={event.id}>
                                <td>{event.name}</td>
                                <td className="action-buttons">
                                    <button className="view-btn">View</button>
                                    <button className="warning-btn">Warning</button>
                                    <button className="suspend-btn">Suspend</button>
                                    <button className="remove-btn">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderDashboard = () => {
        return filterEvents().map(event => (
            <div key={event.id} className="event-post">
                <h2 className="event-title">{event.name} - {event.createdBy}</h2>
                
                <div className="event-images-grid">
                    {event.images?.map((image, index) => (
                        <img 
                            key={index} 
                            src={image} 
                            alt={`${event.name} - ${index + 1}`}
                            className="event-image"
                        />
                    ))}
                </div>

                <div className="event-interactions">
                    <div className="interaction-buttons">
                        <button className="like-btn">
                            <span className="thumb-icon">👍</span>
                        </button>
                        <button className="dislike-btn">
                            <span className="thumb-icon">👎</span>
                        </button>
                    </div>
                    <a href="#" className="report-link">Report this event</a>
                </div>

                <div className="comment-section">
                    <input 
                        type="text" 
                        placeholder="Leave a comment" 
                        className="comment-input"
                    />
                </div>
            </div>
        ));
    };

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
                    <button className="profile-btn" onClick={() => navigate('/ModeratorProfile')}>
                        Profile
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
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

                <main className="main-content">
                    {activeView === 'dashboard' && renderDashboard()}
                    {activeView === 'events' && renderEventManagementTable()}
                </main>
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