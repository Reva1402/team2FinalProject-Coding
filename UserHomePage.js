import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, updateDoc, arrayUnion, onSnapshot, arrayRemove } from 'firebase/firestore';
import './UserHomePage.css';
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
    const [attendance, setAttendance] = useState({});  // Add this state for tracking attendance
    const user = auth.currentUser;

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

            // Set up real-time listeners for each event's comments
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

            return unsubscribeList;  // Return the unsubscribe functions
        };

        // Fetch events and set up real-time listeners
        const fetchEventsAndListeners = async () => {
            const unsubscribeList = await fetchEvents();
            return unsubscribeList;
        };

        // Execute the function and store the unsubscribe functions
        fetchEventsAndListeners().then(unsubscribeList => {
            return () => {
                // Cleanup: unsubscribe from all real-time listeners when the component unmounts
                unsubscribeList.forEach(unsubscribe => unsubscribe());
            };
        });

        // Fetch user data (on mount) or when auth state changes
        const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
            if (currentUser) {
                fetchUserData(currentUser.uid);
            } else {
                setUserName('Guest');
            }
        });

        return () => {
            // Cleanup auth listener on component unmount
            unsubscribeAuth();
        };
    }, []); 

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
            // Fetch event data to check if the user has already liked
            const eventDoc = await getDoc(eventRef);
            const eventData = eventDoc.data();
    
            // Check if the user has already liked this event
            if (eventData.likes && eventData.likes.includes(user.uid)) {
                console.log("Already liked");
                setLikes(prevLikes => ({ ...prevLikes, [eventId]: true })); // Update local state
                return; // Prevent re-liking
            }
    
            // Add user ID to likes array and increment likes count in Firestore
            await updateDoc(eventRef, {
                likes: arrayUnion(user.uid), // Add userId to likes array
                likesCount: increment(1)     // Increment the like count
            });
    
            // Update local state to reflect the like
            setLikes(prevLikes => ({ ...prevLikes, [eventId]: true }));
        } catch (error) {
            console.error('Error liking event:', error);
        }
    };
    
    
    const handleUnlike = async (eventId) => {
        if (!user) return;
    
        const eventRef = doc(firestore, 'events', eventId);
    
        try {
            // Remove user ID from likes array and decrement likes count in Firestore
            await updateDoc(eventRef, {
                likes: arrayRemove(user.uid),   // Remove userId from likes array
                likesCount: increment(-1)       // Decrement the like count
            });
    
            // Update local state to reflect the unlike (disables the unlike button)
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

    const handleAttendance = (eventId) => {
        setAttendance(prevAttendance => ({
            ...prevAttendance,
            [eventId]: !prevAttendance[eventId]  // Toggle attendance status
        }));
    };

    // Fix: Use `userName` for the comment name display
    const handleCommentSubmit = async (eventId, eventData) => {
        eventData.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            alert("You need to be logged in to comment.");
            return;
        }

        const userId = user.uid;
        const commentText = newComments[eventId]?.trim();
        const userNameBy = userName || 'Anonymous';  // Use `userName` from state

        if (commentText) {
            const newComment = {
                text: commentText,
                userId: userId,
                userNameBy: userNameBy,  // Correctly use `userNameBy` here
                eventId: eventId,
                createdAt: new Date()
            };

            // Temporarily update state (optimistic UI update)
            setComments(prevComments => ({
                ...prevComments,
                [eventId]: [...(prevComments[eventId] || []), newComment]
            }));

            // Clear the input field after submission
            setNewComments(prevNewComments => ({ ...prevNewComments, [eventId]: '' }));

            try {
                const eventRef = doc(firestore, 'events', eventId);

                // Update the Firestore document with the new comment
                await updateDoc(eventRef, {
                    comments: arrayUnion(newComment)
                });
            } catch (error) {
                console.error("Error adding comment to Firestore:", error);
                alert("Failed to post the comment. Please try again.");
                // Rollback the optimistic UI update
                setComments(prevComments => {
                    const updatedComments = { ...prevComments };
                    updatedComments[eventId] = updatedComments[eventId]?.filter(comment => comment !== newComment);
                    return updatedComments;
                });
            }
        }
    };

    return (
        <div className="home-page">
            <nav className="navbar">
                <span>Hi, {userName}</span>
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

            <div className="home-content">
                <h2>Welcome to Eventopia</h2>
                <p>Explore events, interact with the community, and stay connected!</p>

                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} className="event-card">
                            <h3>{event.name}</h3>
                            <p>{event.description}</p>
                            <p>Date: {event.date}</p>
                            <p>Location: {event.location}</p>

                            {/* Images Section */}
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
    onClick={() => handleLike(event.id)} 
    disabled={likes[event.id]}
>
    {likes[event.id] ? 'Liked' : 'Like'}
</button>
                            <button onClick={() => handleUnlike(event.id)} disabled={!likes[event.id]}>
                                Unlike
                            </button>




                            <button onClick={() => handleReportEvent(event.id)} disabled={reportedEvents[event.id]}>
                                {reportedEvents[event.id] ? 'Reported' : 'Report Event'}
                            </button>

                            <button onClick={() => navigate(`/attendevent/${event.id}`)}>
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

        </div>
    );
};

export default HomePage;
