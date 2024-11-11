import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import './UserHomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [likes, setLikes] = useState({});
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [reportedComments, setReportedComments] = useState({}); 
    const [reportedEvents, setReportedEvents] = useState({});

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsRef = collection(firestore, 'events');
            const eventSnapshot = await getDocs(eventsRef);
            const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(eventList);

            const eventComments = {};
            for (const event of eventList) {
                const eventRef = doc(firestore, 'events', event.id);
                const eventDoc = await getDoc(eventRef);
                if (eventDoc.exists()) {
                    eventComments[event.id] = eventDoc.data().comments || [];
                }
            }
            setComments(eventComments);
        };
        

        fetchEvents();

        const fetchUsers = async () => {
            const usersRef = collection(firestore, 'users');
            const userSnapshot = await getDocs(usersRef);
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
        };

        fetchUsers();

        const fetchUserData = async (userId) => {
            try {
                const userDoc = await getDoc(doc(firestore, 'users', userId));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().firstName || "User");
                } else {
                    setUserName("User");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserName("User");
            }
        };

        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            if (currentUser) {
                fetchUserData(currentUser.uid);
            } else {
                setUserName("Guest");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filteredUsers = users.filter(user =>
            user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filteredUsers);
    };

    const filterEvents = () => {
        if (searchQuery.trim() === '') {
            return events;
        }

        return events.filter(event =>
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
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

    const handleLike = (eventId) => {
        setLikes(prevLikes => ({
            ...prevLikes,
            [eventId]: true
        }));
    };

    const handleUnlike = (eventId) => {
        setLikes(prevLikes => ({
            ...prevLikes,
            [eventId]: false
        }));
    };

    const handleCommentSubmit = async (eventId, eventData) => {
        eventData.preventDefault();
        const commentText = newComments[eventId]?.trim();
        if (commentText) {
            setComments(prevComments => ({
                ...prevComments,
                [eventId]: [...(prevComments[eventId] || []), commentText]
            }));
            setNewComments(prevNewComments => ({ ...prevNewComments, [eventId]: '' }));

            try {
                const eventRef = doc(firestore, 'events', eventId);
                await updateDoc(eventRef, {
                    comments: arrayUnion(commentText)
                });
            } catch (error) {
                console.error("Error adding comment to Firestore:", error);
                alert("Failed to post the comment. Please try again.");
            }
        }
    };

    const handleNextImage = (eventId, images) => {
        setCurrentImageIndex(prevIndex => ({
            ...prevIndex,
            [eventId]: (prevIndex[eventId] + 1) % images.length
        }));
    };

    const handlePreviousImage = (eventId, images) => {
        setCurrentImageIndex(prevIndex => ({
            ...prevIndex,
            [eventId]: (prevIndex[eventId] - 1 + images.length) % images.length
        }));
    };

    const handleReport = (eventId) => {
        setReportedEvents(prevReportedEvents => ({
            ...prevReportedEvents,
            [eventId]: true 
        }));
    };

    const handleReportComment = (eventId, commentIndex) => {
        setReportedComments(prevReportedComments => ({
            ...prevReportedComments,
            [`${eventId}-${commentIndex}`]: true 
        }));
    };

    const filteredEvents = filterEvents();

    return (
        <div className="home-page">
            <nav className="navbar">
                <span>Hi, {userName}</span>
                <input
                    type="text"
                    placeholder="Search events or users..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch();
                    }}
                    className="search-bar"
                />
                <ul className="nav-links">
                    {userName !== 'Guest' && (
                        <>
                            <li onClick={() => navigate('/UserProfile')}>Profile</li>
                            <li onClick={() => navigate('/createevent')}>Create An Event</li>
                            <li onClick={() => navigate('/MyEvents')}>My Events</li>
                            <li onClick={() => navigate('/notifications')}>Notifications</li>
                            <li onClick={() => navigate('/followers')}>Followers</li>
                        </>
                    )}
                </ul>
                {userName !== 'Guest' && (
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                )}
            </nav>

            <div className="home-content">
                <h2>Welcome to Eventopia</h2>
                <p>Explore events, interact with the community, and stay connected!</p>

                <h3>Events</h3>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <div key={event.id} className="event-card">
                            <h3>{event.name}</h3>
                            <p><strong>Date:</strong> {event.date}</p>
                            <p><strong>Time:</strong> {event.time}</p>
                            <p><strong>Location:</strong> {event.location}</p>
                            <p>{event.description}</p>

                            {event.images && event.images.length > 0 && (
                                <div className="event-image-carousel">
                                    <button
                                        onClick={() => handlePreviousImage(event.id, event.images)}
                                        className="carousel-btn"
                                    >
                                        &lt;
                                    </button>
                                    <img
                                        src={event.images[currentImageIndex[event.id] || 0]}
                                        alt={`${event.name} Event`}
                                        className="event-image"
                                    />
                                    <button
                                        onClick={() => handleNextImage(event.id, event.images)}
                                        className="carousel-btn"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}

                            <div className="action-buttons">
                                <button
                                    onClick={() => navigate(`/event/${event.id}`)} 
                                    className="attend-btn"
                                >
                                    Give Attendance
                                </button>
                                <button
                                    onClick={() => handleLike(event.id)}
                                    className="like-btn"
                                    disabled={likes[event.id]}
                                >
                                        👍
                                </button>
                                <button
                                    onClick={() => handleUnlike(event.id)}
                                    className="unlike-btn"
                                    disabled={!likes[event.id]}
                                >
                                        👎
                                </button>
                                <button
                                    onClick={() => handleReport(event.id)}
                                    className="report-btn"
                                    disabled={reportedEvents[event.id]}
                                >
                                    {reportedEvents[event.id] ? 'Reported' : 'Report this Event'}
                                </button>
                            </div>

                            <div className="comments-section">
                                <h4>Comments</h4>
                                <ul className="comments-list">
                                    {(comments[event.id] || []).map((comment, index) => (
                                        <li key={index}>
                                            {comment}
                                            <button
                                                onClick={() => handleReportComment(event.id, index)}
                                                className="report-comment-btn"
                                                disabled={reportedComments[`${event.id}-${index}`]} 
                                            >
                                                {reportedComments[`${event.id}-${index}`] ? 'Reported' : 'Report'}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <form
                                    onSubmit={(e) => handleCommentSubmit(event.id, e)}
                                    className="comment-form"
                                >
                                    <input
                                        type="text"
                                        value={newComments[event.id] || ''}
                                        onChange={(e) => setNewComments(prev => ({ ...prev, [event.id]: e.target.value }))}
                                        placeholder="Add a comment..."
                                    />
                                    <button type="submit">Post Comment</button>
                                </form>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}

                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Search Results:</h3>
                        <ul>
                            {searchResults.map(user => (
                                <li key={user.id}>{user.firstName} {user.lastName}</li>
                            ))}
                        </ul>
                    </div>
                )}
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

export default HomePage;
