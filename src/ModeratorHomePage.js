import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    increment,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './ModeratorHomePage.css';
import './Header.css';
import './Footer.css';

const ModeratorHomePage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [likes, setLikes] = useState({});
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().firstName || 'Moderator');
                }
                setLoading(false);
            } else {
                navigate('/login');
            }
        };

        const fetchEvents = async () => {
            const eventsRef = collection(firestore, 'events');
            const eventSnapshot = await getDocs(eventsRef);
            const eventList = eventSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(eventList);

            eventList.forEach((event) => {
                const eventRef = doc(firestore, 'events', event.id);
                onSnapshot(eventRef, (eventDoc) => {
                    if (eventDoc.exists()) {
                        setComments((prev) => ({
                            ...prev,
                            [event.id]: eventDoc.data().comments || [],
                        }));
                    }
                });
            });
        };

        fetchUserData();
        fetchEvents();
    }, [navigate]);

    const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate("/login");
        } catch (error) {
          console.error("Logout error:", error);
        }
      };

    const handleLike = async (eventId) => {
        const eventRef = doc(firestore, 'events', eventId);
        await updateDoc(eventRef, {
            likes: arrayUnion(auth.currentUser.uid),
            likesCount: increment(1),
        });
        setLikes((prev) => ({ ...prev, [eventId]: true }));
    };

    const handleUnlike = async (eventId) => {
        const eventRef = doc(firestore, 'events', eventId);
        await updateDoc(eventRef, {
            likes: arrayRemove(auth.currentUser.uid),
            likesCount: increment(-1),
        });
        setLikes((prev) => ({ ...prev, [eventId]: false }));
    };

    const handleReportEvent = (eventId) => {
        navigate(`/reportContent/${auth.currentUser.uid}/${eventId}`);
    };

    const handleCommentSubmit = async (eventId, e) => {
        e.preventDefault();
        if (isSubmitting[eventId]) return;

        setIsSubmitting((prev) => ({ ...prev, [eventId]: true }));
        const commentText = newComments[eventId]?.trim();
        if (!commentText) return;

        const newComment = {
            text: commentText,
            userId: auth.currentUser.uid,
            userNameBy: userName,
            createdAt: new Date().toISOString(),
        };

        const eventRef = doc(firestore, 'events', eventId);
        await updateDoc(eventRef, { comments: arrayUnion(newComment) });
        setComments((prev) => ({
            ...prev,
            [eventId]: [...(prev[eventId] || []), newComment],
        }));
        setNewComments((prev) => ({ ...prev, [eventId]: '' }));
        setIsSubmitting((prev) => ({ ...prev, [eventId]: false }));
    };

    const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="moderator-homepage">
            {/* Header */}
            <nav className="navbar">
                <h2>Welcome, {userName}</h2>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
        <div className="moderator-button-container">
        <button className="moderator-profile-button" onClick={() => navigate('/ModeratorProfile')}>Profile</button>
        <button className="moderator-logout-button" onClick={handleLogout}>Logout</button>
        </div>
            </nav>

            {/* Sidebar and Main Content */}
            <div className="moderator-content">
                <aside className="sidebar">
                    <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorHomePage">Feed</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>

                <div className="main-content">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="event-post">
                            <h3 className="event-title">{event.name}</h3>
                            <p>{event.description}</p>
                            {event.images?.length > 0 && (
                                <div className="event-images-grid">
                                    {event.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Event Image ${idx + 1}`}
                                            className="event-image"
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="event-interactions">
                                <div className="interaction-buttons">
                                    <button
                                        className="like-btn"
                                        onClick={() => handleLike(event.id)}
                                        disabled={likes[event.id]}
                                    >
                                        Like
                                    </button>
                                    <button
                                        className="dislike-btn"
                                        onClick={() => handleUnlike(event.id)}
                                        disabled={!likes[event.id]}
                                    >
                                        Unlike
                                    </button>
                                </div>
                                <a
                                    href="#"
                                    className="report-link"
                                    onClick={() => handleReportEvent(event.id)}
                                >
                                    Report
                                </a>
                            </div>
                            <div className="comments-section">
                                <h4>Comments</h4>
                                <ul>
                                    {(comments[event.id] || []).map((comment, idx) => (
                                        <li key={idx}>
                                            <strong>{comment.userNameBy}:</strong> {comment.text}
                                        </li>
                                    ))}
                                </ul>
                                <form onSubmit={(e) => handleCommentSubmit(event.id, e)}>
                                    <input
                                        type="text"
                                        className="comment-input"
                                        placeholder="Write a comment..."
                                        value={newComments[event.id] || ''}
                                        onChange={(e) =>
                                            setNewComments((prev) => ({
                                                ...prev,
                                                [event.id]: e.target.value,
                                            }))
                                        }
                                    />
                                    <button
                                    className="comment-post"
                                        type="submit"
                                        disabled={isSubmitting[event.id]}
                                    >
                                        {isSubmitting[event.id] ? 'Posting...' : 'Post'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
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

export default ModeratorHomePage;
