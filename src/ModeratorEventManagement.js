import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import './ModeratorEventManagement.css';

const ModeratorEventManagement = () => {
    const [reportedEvents, setReportedEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userNames, setUserNames] = useState({});  
    const navigate = useNavigate();

    useEffect(() => {
        fetchReportedEvents();
        const unsubscribe = listenForStatusUpdates();
        return () => unsubscribe();
    }, []);

   
    const fetchReportedEvents = async () => {
        try {
            const reportsRef = collection(firestore, 'reports');
            const snapshot = await getDocs(reportsRef);

            
            const userRef = collection(firestore, 'users');
            const userSnapshots = await getDocs(userRef);
            const users = userSnapshots.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data(); 
                return acc;
            }, {});

            const eventsRef = collection(firestore, 'events');
            const eventsSnapshot = await getDocs(eventsRef);
            const events = eventsSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data(); 
                return acc;
            }, {});

            
            const eventsList = snapshot.docs
                .map(doc => doc.data())
                .filter(report => {
                    const userExists = users[report.eventCreator];
                    const eventExists = events[report.eventId];
                    return userExists && eventExists; 
                })
                .map(report => ({
                    eventId: report.eventId,  
                    eventName: events[report.eventId]?.name || 'Unknown',  
                    eventCreator: report.eventCreator, 
                    status: report.status || 'active',
                    reportedAt: report.reportedAt || 'N/A' 
                }));

            setReportedEvents(eventsList);
            setFilteredEvents(eventsList);

           
            const validUserNames = eventsList.reduce((acc, event) => {
                const userData = users[event.eventCreator];
                if (userData) {
                    acc[event.eventCreator] = userData.firstName;
                }
                return acc;
            }, {});
            setUserNames(validUserNames);

        } catch (error) {
            console.error('Error fetching reported events:', error);
        }
    };

    const listenForStatusUpdates = () => {
        const eventsRef = collection(firestore, 'events');
        return onSnapshot(eventsRef, (snapshot) => {
            const updatedEvents = snapshot.docs.map(doc => ({
                eventId: doc.id,
                ...doc.data(),
            }));

            setReportedEvents(prevEvents =>
                prevEvents.map(event => {
                    const updatedEvent = updatedEvents.find(updated => updated.eventId === event.eventId);
                    return updatedEvent ? { ...event, status: updatedEvent.status } : event;
                })
            );
            setFilteredEvents(prevEvents =>
                prevEvents.map(event => {
                    const updatedEvent = updatedEvents.find(updated => updated.eventId === event.eventId);
                    return updatedEvent ? { ...event, status: updatedEvent.status } : event;
                })
            );
        });
    };

    const suspendEvent = async (eventId) => {
        try {
            await updateDoc(doc(firestore, 'events', eventId), { status: 'suspended' });
            alert('Event suspended successfully!');
        } catch (error) {
            console.error('Error suspending event:', error);
            alert('Failed to suspend the event.');
        }
    };

    const activateEvent = async (eventId) => {
        try {
            await updateDoc(doc(firestore, 'events', eventId), { status: 'active' });
            alert('Event activated successfully!');
        } catch (error) {
            console.error('Error activating event:', error);
            alert('Failed to activate the event.');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search term');
            return;
        }
    };

    const viewEvent = (eventId) => {
        navigate(`/adminModeratorEventView/${eventId}`);
    };

    return (
        <div className="moderator-management-container">
            <h2>Reported Events</h2>
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

            <table className="moderator-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Event Creator</th>
                        <th>Status</th>
                        <th>Reported At</th> 
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEvents.map((event, index) => (
                        <tr key={index}>
                            <td>{event.eventName}</td>
                            <td>{userNames[event.eventCreator]}</td> 
                            <td>{event.status}</td>
                            <td>{event.reportedAt}</td> 
                            <td className="action-buttons">
                                <button className="view-button" onClick={() => viewEvent(event.eventId)}>View</button>
                                {event.status === 'suspended' ? (
                                    <button className="activate-button" onClick={() => activateEvent(event.eventId)}>Activate</button>
                                ) : (
                                    <button className="suspend-button" onClick={() => suspendEvent(event.eventId)}>Suspend</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <footer className="loginpage-footer">
        <ul className="loginpage-footer-links">
          <li className="loginpage-footer-link" onClick={() => navigate('/about')}>About</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
        </div>
    );
};

export default ModeratorEventManagement;
