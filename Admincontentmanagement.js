import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import './Admincontentmanagement.css';
import {
    getModerators,
    viewModerator,
    editModerator,
    demoteModerator,
    suspendModerator,
    deleteModerator,
} from './moderatorService'; 
import './ModeratorManagement.css'; 

const Admincontentmanagement = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');
    const [activeView, setActiveView] = useState('users');
    const [moderators, setModerators] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                navigate('/moderatorlogin');
                return;
            }

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

    // ModeratorManagement
    const fetchModerators = async () => {
        const data = await getModerators();
        setModerators(data);
    };

    useEffect(() => {
        fetchModerators(); 
    }, []);

    
    const handleSuspend = async (id) => {
        await suspendModerator(id);
        fetchModerators(); 
    };

    const handleDelete = async (id) => {
        await deleteModerator(id);
        fetchModerators(); 
    };

    const suspendEvent = async (id) =>{
        const updatedList = events.filter((event) => event.id !== id);
        setEvents(updatedList);
    }

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

    const renderUsermanagement = () =>{
        navigate("/usermanagement");
    }

    const renderContentManagement = () => {
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
                                    <button className="view-btn" onClick={()=>navigate(`/event/${event.id}`)}>View</button>
                                    <button className="suspend-btn" onClick={()=>suspendEvent(`${event.id}`)}>Suspend</button>
                                    <button className="remove-btn" onClick={()=>handleDelete(`${event.id}`)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    const renderManagement = () =>{
        navigate("/ModeratorManagement");
    }

    const renderSuspendedResources = () => {
        navigate("/");
    }

    const renderSecurityRules = () => {
        navigate("/");
    }

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
                    <button className="logout-btn" onClick={() => navigate('/login')}>
                        Log Out
                    </button>
                </div>
            </nav>

            <div className="moderator-content">
                <aside className="sidebar">
                    <ul>
                        <li onClick={() => setActiveView('usermanagement')}>User Management</li>
                        <li onClick={() => setActiveView('moderator-management')}>Moderator Management</li>
                        <li onClick={() => setActiveView('suspended-resources')}>Suspended Resource</li>
                        <li onClick={() => setActiveView('content-management')}>Content Management</li>
                        <li onClick={() => setActiveView('security-rules')}>Security Rules</li>
                    </ul>
                </aside>

                <main className="main-content">
                    {activeView === 'usermanagement' && renderUsermanagement()}
                    {activeView === 'moderator-management' && renderManagement()}
                    {activeView === 'suspended-resources' && renderSuspendedResources()}
                    {activeView === 'content-management' && renderContentManagement()}
                    {activeView === 'security-rules' && renderSecurityRules()}
    
                    

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

export default Admincontentmanagement; 