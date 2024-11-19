import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, updateDoc, arrayUnion, onSnapshot, arrayRemove } from 'firebase/firestore';
import './UserHomePage.css';
import './Header.css';
import './Footer.css';
import { increment } from 'firebase/firestore';


const HomePage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [likes, setLikes] = useState({});
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [updatedComments, setUpdatedComments] = useState({});
    const [userName, setUserName] = useState('');
    const [reportedEvents, setReportedEvents] = useState({});
    const [attendance, setAttendance] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const user = auth.currentUser;
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsRef = collection(firestore, 'events');
            const eventSnapshot = await getDocs(eventsRef);
            const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(eventList);

            const userLikes = {};
            if (user) {
                eventList.forEach(event => {
                    if (event.likes && event.likes.includes(user.uid)) {
                        userLikes[event.id] = true;
                    }
                });
            }
            setLikes(userLikes);

            const unsubscribeList = eventList.map(event => {
                const eventRef = doc(firestore, 'events', event.id);
                return onSnapshot(eventRef, (eventDoc) => {
                    if (eventDoc.exists()) {
                        const eventCommentsData = eventDoc.data().comments || [];
                        setComments(prevComments => ({
                            ...prevComments,
                            [event.id]: eventCommentsData
                        }));
                    }
                });
            });

            return unsubscribeList;
        };

        const fetchEventsAndListeners = async () => {
            const unsubscribeList = await fetchEvents();
            return unsubscribeList;
        };

        fetchEventsAndListeners().then(unsubscribeList => {
            return () => {
                unsubscribeList.forEach(unsubscribe => unsubscribe());
            };
        });

        const fetchAllUsers = async () => {
            await fetchUsers();
        };

        fetchAllUsers(); 

        const fetchAllEvents = async () => {
            await fetchEvents();
        };

        fetchAllEvents();

        const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
            if (currentUser) {
                fetchUserData(currentUser.uid);
            } else {
                setUserName('Guest');
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    const fetchUsers = async () => {
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
    };

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

    const handleLike = async (eventId) => {
        if (!user) return;

        const eventRef = doc(firestore, 'events', eventId);

        try {
            const eventDoc = await getDoc(eventRef);
            const eventData = eventDoc.data();

            if (eventData.likes && eventData.likes.includes(user.uid)) {
                console.log("Already liked");
                setLikes(prevLikes => ({ ...prevLikes, [eventId]: true }));
                return;
            }

            await updateDoc(eventRef, {
                likes: arrayUnion(user.uid),
                likesCount: increment(1)
            });

            setLikes(prevLikes => ({ ...prevLikes, [eventId]: true }));
        } catch (error) {
            console.error('Error liking event:', error);
        }
    };

    const handleUnlike = async (eventId) => {
        if (!user) return;

        const eventRef = doc(firestore, 'events', eventId);

        try {
            await updateDoc(eventRef, {
                likes: arrayRemove(user.uid),
                likesCount: increment(-1)
            });

            setLikes(prevLikes => ({ ...prevLikes, [eventId]: false }));
        } catch (error) {
            console.error('Error unliking event:', error);
        }
    };

    const handleReportEvent = (eventId) => {
        const reporterId = auth.currentUser?.uid;
        if (reporterId) {
            navigate(`/reportContent/${reporterId}/${eventId}`);
        } else {
            alert('You need to be logged in to report an event.');
        }
    };

    const handleReportComment = (eventId, commentId, commenterId) => {
        const reporterId = auth.currentUser?.uid;
        if (reporterId) {
            navigate(`/reportContent/${reporterId}/${eventId}/${commentId}/${commenterId}`);
        } else {
            alert('You need to be logged in to report a comment.');
        }
    };

    const handleCommentSubmit = async (eventId, eventData) => {
        eventData.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            alert("You need to be logged in to comment.");
            return;
        }

        const userId = user.uid;
        const commentText = newComments[eventId]?.trim();
        const userNameBy = userName || 'Anonymous';

        if (commentText) {
            const newComment = {
                text: commentText,
                userId: userId,
                userNameBy: userNameBy,
                eventId: eventId,
                createdAt: new Date()
            };

            setComments(prevComments => ({
                ...prevComments,
                [eventId]: [...(prevComments[eventId] || []), newComment]
            }));

            setNewComments(prevNewComments => ({ ...prevNewComments, [eventId]: '' }));

            try {
                const eventRef = doc(firestore, 'events', eventId);
                await updateDoc(eventRef, {
                    comments: arrayUnion(newComment)
                });
            } catch (error) {
                console.error("Error adding comment to Firestore:", error);
                alert("Failed to post the comment. Please try again.");

                setComments(prevComments => {
                    const updatedComments = { ...prevComments };
                    updatedComments[eventId] = updatedComments[eventId]?.filter(comment => comment !== newComment);
                    return updatedComments;
                });
            }
        }
    };

    const handleSearch = () => {
        console.log("Search Query:", searchQuery);
        if (searchQuery.trim() === '') {
            console.log("Search query is empty");
            return;
        }

      
        const eventsResult = events.filter(event =>
            event?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const usersResult = users.filter(user =>
            (user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        console.log("Filtered Events:", eventsResult);
        console.log("Filtered Users:", usersResult);

        setFilteredEvents(eventsResult);
        setFilteredUsers(usersResult);
    };

    const handleEventClick = (eventId) => {
        navigate(`/adminModeratorEventView/${eventId}`);
    };

    const handleUserClick = (userId) => {
        navigate(`/adminModeratorUserProfile/${userId}`);
    };

    return (
        <div className="unique-page-wrapper">
        <div className="home-page">
            <nav className="navbar">
            <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
          Hi, {userName || 'User'}
        </div>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn" onClick={handleSearch} >Search</button>

                <ul className="nav-links">
                    {userName !== 'Guest' && (
                        <>
                            <li onClick={() => navigate('/UserProfile')}>Profile</li>
                            <li onClick={() => navigate('/createevent')}>Post An Event</li>
                            <li onClick={() => navigate('/MyEvents')}>My Events</li>
                            <li onClick={() => navigate('/notifications')}>Notifications</li>
                            <li onClick={() => navigate('/followers')}>Followers</li>
                        </>
                    )}
                </ul>
                {userName !== 'Guest' && (
                    <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
                )}
            </nav>

            {searchQuery && (filteredEvents.length > 0 || filteredUsers.length > 0) && (
                <div className="search-results">
                    <h2>Search Results</h2>
                    {filteredEvents.length > 0 && (
                        <div>
                            <h3>Events:</h3>
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="event-card" onClick={() => handleEventClick(event.id)}>
                                    <h4>{event.eventName}</h4>
                                </div>
                            ))}
                        </div>
                    )}
                    {filteredUsers.length > 0 && (
                        <div>
                            <h3>Users:</h3>
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="user-card" onClick={() => handleUserClick(user.id)}>
                                    <h4>{user.firstName} {user.lastName}</h4>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!searchQuery && (
                <div className="eventfeedContent">
                    <h2>Welcome to Eventopia</h2>
                    <p>Explore events, interact with the community, and stay connected!</p>

                    {events.length > 0 ? (
                        events.map(event => (
                            <div key={event.id} className="event-card">
                                <h3>{event.name}</h3>
                                <p>{event.description}</p>
                                <p>Date: {event.date}</p>
                                <p>Location: {event.location}</p>
                                <h4>Likes: {event.likesCount}</h4>

                                {event.images && event.images.length > 0 && (
                                    <div className="event-images">
                                        {event.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Event ${event.name} - Image ${index + 1}`}
                                                className="event-image"
                                            />
                                        ))}
                                    </div>
                                )}
                                

                                <button
                                className="like-btn"
                                    onClick={() => handleLike(event.id)}
                                    disabled={likes[event.id]}
                                >
                                    {likes[event.id] ? 'Liked' : 'Like'}
                                </button>

                                <button
                                 className="unlike-btn"
                                    onClick={() => handleUnlike(event.id)} disabled={!likes[event.id]}>
                                    Unlike
                                </button>

                                <button 
                                className="report-btn"
                                    onClick={() => handleReportEvent(event.id)} disabled={reportedEvents[event.id]}>
                                    {reportedEvents[event.id] ? 'Reported' : 'Report Event'}
                                </button>

                                <button 
                                className="attend-btn"
                                onClick={() => navigate(`/attendevent/${event.id}`)}>
                                    Attend Event
                                </button>

                                <div className="comments-section">
                                    <h4>Comments</h4>
                                    <ul className="comments-list">
                                        {(comments[event.id] || []).map((comment, index) => (
                                            <li key={index}>
                                                <span
                                                    onClick={() => navigate(`/userProfile/${comment.userId}`)}
                                                    className="comment-user"
                                                    style={{ cursor: 'pointer', color: 'blue' }}
                                                >
                                                    {comment.userNameBy}
                                                </span>
                                                : {comment.text}
                                                <span>
                                                    <button
                                                    className="report-comment"
                                                        onClick={() => handleReportComment(event.id, comment.id, comment.userId)}
                                                        disabled={reportedEvents[comment.id]}
                                                    >
                                                        
                                                        {reportedEvents[comment.id] ? 'Reported' : 'Report Comment'}
                                                    </button>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <form onSubmit={(e) => handleCommentSubmit(event.id, e)} className="comment-form">
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
                </div>
            )}

            <footer className="footer">
                <ul className="footer-links">
                    <li onClick={() => navigate('/about')}>About</li>
                    <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                    <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                    <li onClick={() => navigate('/contactus')}>Contact Us</li>
                </ul>
            </footer>
        </div>
</div>
    );
};

export default HomePage;
