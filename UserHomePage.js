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

    // Fetch events, users, and user data on mount
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
                    const eventCommentsData = eventDoc.data().comments || [];
                    eventComments[event.id] = eventCommentsData.map(comment => typeof comment === 'object' ? comment.text : comment);
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
                fetchUserData(currentUser.uid);  // Ensure this is being called correctly
            } else {
                setUserName("Guest");
            }
        });
        
        return () => unsubscribe();
        
    }, []);

    useEffect(() => {
        const savedReportedEvents = JSON.parse(localStorage.getItem('reportedEvents'));
        const savedReportedComments = JSON.parse(localStorage.getItem('reportedComments'));
        if (savedReportedEvents) {
            setReportedEvents(savedReportedEvents);
        }

        if (savedReportedComments) {
            setReportedComments(savedReportedComments);
        }
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filteredUsers = users.filter(user =>
            (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        setSearchResults(filteredUsers);
    };

    const filterEvents = () => {
        if (searchQuery.trim() === '') {
            return events;
        }

        return events.filter(event =>
            (event.name && event.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
        setLikes(prevLikes => ({ ...prevLikes, [eventId]: true }));
    };

    const handleUnlike = (eventId) => {
        setLikes(prevLikes => ({ ...prevLikes, [eventId]: false }));
    };

    const handleCommentSubmit = async (eventId, eventData) => {
        eventData.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            alert("You need to be logged in to comment.");
            return;
        }

        const userId = user.uid;
        const userName = user.displayName || "Anonymous"; 
        const commentText = newComments[eventId]?.trim();

        if (commentText) {
            const newComment = {
                text: commentText,
                userId: userId,
                userName: userName,
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
                await updateDoc(eventRef, { comments: arrayUnion(newComment) });
            } catch (error) {
                console.error("Error adding comment to Firestore:", error);
                alert("Failed to post the comment. Please try again.");
            }
        }
    };

    const handlePreviousImage = (eventId, images) => {
        setCurrentImageIndex(prevState => {
            const currentIndex = prevState[eventId] || 0;
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            return { ...prevState, [eventId]: newIndex };
        });
    };

    const handleNextImage = (eventId, images) => {
        setCurrentImageIndex(prevState => {
            const currentIndex = prevState[eventId] || 0;
            const newIndex = (currentIndex + 1) % images.length;
            return { ...prevState, [eventId]: newIndex };
        });
    };

    const handleReport = (eventId) => {
        const updatedReportedEvents = { ...reportedEvents, [eventId]: true };
        setReportedEvents(updatedReportedEvents);
        localStorage.setItem('reportedEvents', JSON.stringify(updatedReportedEvents));

        navigate(`/reportContent/${eventId}`);  // Navigate to report content page for the event
    };

    const handleReportComment = (eventId, commentIndex) => {
        const key = `${eventId}-${commentIndex}`;
        const updatedReportedComments = { ...reportedComments, [key]: true };
        setReportedComments(updatedReportedComments);
        localStorage.setItem('reportedComments', JSON.stringify(updatedReportedComments));

        navigate(`/reportContent/${eventId}/${commentIndex}`);  // Navigate to report content page for the comment
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
                            <p><strong>Description:</strong> {event.description}</p>

                            <button onClick={() => handleReport(event.id)}>Report Event</button>

                            {event.images && event.images.length > 0 && (
                                <div className="carousel">
                                    <button onClick={() => handlePreviousImage(event.id, event.images)}>Previous</button>
                                    <img
                                        src={event.images[currentImageIndex[event.id] || 0]}
                                        alt={event.name}
                                    />
                                    <button onClick={() => handleNextImage(event.id, event.images)}>Next</button>
                                </div>
                            )}

                            <div className="comments-section">
                                <h4>Comments</h4>
                                {comments[event.id]?.map((comment, index) => (
                                    <div key={index} className="comment">
                                        <p>{comment.userName}: {comment.text}</p>
                                        <button onClick={() => handleReportComment(event.id, index)}>
                                            Report Comment
                                        </button>
                                    </div>
                                ))}

                                <form onSubmit={(e) => handleCommentSubmit(event.id, e)}>
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={newComments[event.id] || ''}
                                        onChange={(e) => setNewComments({ ...newComments, [event.id]: e.target.value })}
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
        </div>
    );
};

export default HomePage;
