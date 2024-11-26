import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import './suspendedresources.css';
const SuspendedResources = () => {
    const [suspendedUsers, setSuspendedUsers] = useState([]);
    const [suspendedEvents, setSuspendedEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const usersRef = collection(firestore, 'users');
        const suspendedUsersQuery = query(usersRef, where('status', '==', 'suspended'));

        const unsubscribeUsers = onSnapshot(suspendedUsersQuery, (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched suspended users:', userList); 
            setSuspendedUsers(userList);
        });

        const eventsRef = collection(firestore, 'events');
        const suspendedEventsQuery = query(eventsRef, where('status', '==', 'suspended'));

        const unsubscribeEvents = onSnapshot(suspendedEventsQuery, (snapshot) => {
            console.log("Snapshot for events:", snapshot); 
            const eventList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Fetched suspended events:", eventList); 
            setSuspendedEvents(eventList);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeEvents();
        };
    }, []);

    
    const activateUser = async (userId) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, { status: 'active' });
            alert('User reactivated successfully');
        } catch (error) {
            console.error('Error reactivating user:', error);
            alert('Failed to reactivate user');
        }
    };

    const activateEvent = async (eventId) => {
        try {
            const eventRef = doc(firestore, 'events', eventId);
            await updateDoc(eventRef, { status: 'active' });
            alert('Event reactivated successfully');
        } catch (error) {
            console.error('Error reactivating event:', error);
            alert('Failed to reactivate event');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <div className="adminsuspendeddashboard">
            <header className="suspendednavbar">
                <h1 onClick={() => navigate('/AdminDashboard')}>Admin One</h1>
                <div className="navbarsuspendedright">
                    <Link to="/AdminProfile" className="profilesuspendedlink" style={{ color: "white" }}>Profile</Link>
                    <button className="logoutsuspendedbtn" onClick={handleLogout}>Log Out</button>
                </div>
            </header>

            <div className="usersuspendedmanagementsidebar">
                <Link to="/AdminDashboard">Dashboard</Link>
                <Link to="/users">User Management</Link>
                <Link to="/ModeratorManagement">Moderator Management</Link>
                <Link to="/suspendedresources" className="active">Suspended Resources</Link>
                <Link to="/Admincontentmanagement">Content Management</Link>
                <Link to="/Adminsupport">Support Management</Link>
                <h4>
    <a href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules" target="_blank" rel="noopener noreferrer">
      Security Rules
    </a>
  </h4>
            </div>

            <div className="adminsuspendedresources">
                <h2>Suspended Users</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suspendedUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.firstName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <button onClick={() => activateUser(user.id)}>Reactivate</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2>Suspended Events</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suspendedEvents.map(event => (
                            <tr key={event.id}>
                                <td>{event.name}</td>
                                <td>
                                    <button onClick={() => activateEvent(event.id)}>Reactivate</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="suspendedFooter">
                    <ul className="suspendedfooterlinks">
                        <li onClick={() => navigate('/about')}>About</li>
                        <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                        <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                        <li onClick={() => navigate('/contactus')}>Contact Us</li>
                    </ul>
                </footer>
        </div>
    );
};

export default SuspendedResources;
