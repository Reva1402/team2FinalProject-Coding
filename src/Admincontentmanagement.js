import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
import './Admincontentmanagement.css';
import './Footer.css';
import './Header.css';

const Admincontentmanagement = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState(''); 
    const [activeView, setActiveView] = useState('content-management');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                navigate('/moderatorlogin');
                return;
            }

            try {
                const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                if (!userDoc.exists()) {
                    navigate('/moderatorlogin');
                    return;
                }
                setUserName(userDoc.data().firstName || "Moderator");
            } catch (error) {
                console.error("Error verifying moderator status:", error);
                navigate('/moderatorlogin');
            }

           
            fetchEvents();
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchEvents = () => {
        
        const eventsRef = collection(firestore, 'events');
        onSnapshot(eventsRef, (snapshot) => {
            const eventList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventList);
        });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
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

    const suspendEvent = async (id) => {
        try {
           
            const eventRef = doc(firestore, 'events', id);
            
           
            const eventDoc = await getDoc(eventRef);
            
           
            if (eventDoc.exists()) {
                await updateDoc(eventRef, {
                    status: 'suspended'  
                });
                alert('Event suspended successfully');
            } else {
                console.log("Event not found!");
            }
        } catch (error) {
            console.error('Error suspending event:', error);
            alert('Failed to suspend event');
        }
    };

    const activateEvent = async (id) => {
        try {
           
            const eventRef = doc(firestore, 'events', id);
            
         
            const eventDoc = await getDoc(eventRef);
            
          
            if (eventDoc.exists()) {
                await updateDoc(eventRef, {
                    status: 'active'  
                });
                alert('Event activated successfully');
            } else {
                console.log("Event not found!");
            }
        } catch (error) {
            console.error('Error activating event:', error);
            alert('Failed to activate event');
        }
    };

    const deleteEvent = async (id) => {
       
        const isConfirmed = window.confirm('Are you sure you want to delete this event?');
        if (!isConfirmed) return;

        try {
            await deleteDoc(doc(firestore, 'events', id));
            alert('Event deleted successfully');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

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
                                    <button className="view-btn" onClick={() => navigate(`/adminModeratorEventView/${event.id}`)}>View</button>
                                    {event.status === 'active' ? (
                                        <button className="suspend-btn" onClick={() => suspendEvent(event.id)}>Suspend</button>
                                    ) : (
                                        <button className="activate-btn" onClick={() => activateEvent(event.id)}>Activate</button>
                                    )}
                                    <button className="remove-btn" onClick={() => deleteEvent(event.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderSuspendedResources = () => {
        const suspendedEvents = events.filter(event => event.status === 'suspended');
        return (
            <div className="suspended-resources-table">
                <h2>Suspended Events</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suspendedEvents.map(event => (
                            <tr key={event.id}>
                                <td>{event.name}</td>
                                <td className="action-buttons">
                                    <button className="view-btn" onClick={() => navigate(`/event/${event.id}`)}>View</button>
                                    <button className="activate-btn" onClick={() => activateEvent(event.id)}>Activate</button>
                                    <button className="remove-btn" onClick={() => deleteEvent(event.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="moderator-page">
            <header className="navbar">
            <h1 onClick={() => navigate('/AdminDashboard')}>Welcome Admin</h1>
            <div className="moderator-button-container">
            <button className="moderator-profile-button" onClick={() => navigate('/AdminProfile')}>Profile</button>
            <button className="moderator-logout-button" onClick={handleLogout}>Logout</button>
            </div>
            </header>

            <div className="moderator-content">
                <div className="sidebar">
                <Link to="/AdminDashboard">Dashboard</Link>
                    <Link to="/users">User Management</Link>
                    <Link to="/ModeratorManagement">
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

                <main className="main-content">
                    {activeView === 'content-management' && renderContentManagement()}
                    {activeView === 'suspended-resources' && renderSuspendedResources()}
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
