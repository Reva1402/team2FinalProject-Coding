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
    increment
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './ModeratorHomePage.css';

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
                    setLoading(false);  
                }
            } else {
                navigate('/login');
            }
        };

        const fetchEvents = async () => {
            const eventsRef = collection(firestore, 'events');
            const eventSnapshot = await getDocs(eventsRef);
            const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(eventList);

         
            eventList.forEach(event => {
                const eventRef = doc(firestore, 'events', event.id);
                onSnapshot(eventRef, (eventDoc) => {
                    if (eventDoc.exists()) {
                        const eventCommentsData = eventDoc.data().comments || [];
                        setComments(prevComments => ( {
                            ...prevComments,
                            [event.id]: eventCommentsData
                        }));
                    }
                });
            });
        };

        fetchUserData();
        fetchEvents();
    }, [navigate]);

    const handleLike = async (eventId) => {
        if (!auth.currentUser) return;
        const eventRef = doc(firestore, 'events', eventId);
        await updateDoc(eventRef, {
            likes: arrayUnion(auth.currentUser.uid),
            likesCount: increment(1)
        });
        setLikes(prevLikes => ({ ...prevLikes, [eventId]: true }));
        console.log('Liked event with ID:', eventId);
    };

    const handleUnlike = async (eventId) => {
        if (!auth.currentUser) return;
        const eventRef = doc(firestore, 'events', eventId);
        await updateDoc(eventRef, {
            likes: arrayRemove(auth.currentUser.uid),
            likesCount: increment(-1)
        });
        setLikes(prevLikes => ({ ...prevLikes, [eventId]: false }));
        console.log('Unliked event with ID:', eventId);
    };



    const handleCommentSubmit = async (eventId, e) => {
        e.preventDefault();

       
        if (isSubmitting[eventId]) return;

        setIsSubmitting(prev => ({ ...prev, [eventId]: true })); 

        if (!auth.currentUser) return;

        const commentText = newComments[eventId]?.trim();
        if (!commentText) return;

        const newComment = {
            text: commentText,
            userId: auth.currentUser.uid,
            userNameBy: userName,
            createdAt: new Date().toISOString(), 
        };

        const eventRef = doc(firestore, 'events', eventId);
        await updateDoc(eventRef, {
            comments: arrayUnion(newComment),
        });

       
        setComments(prevComments => ({
            ...prevComments,
            [eventId]: [...(prevComments[eventId] || []), newComment],
        }));

        setNewComments(prevNewComments => ({ ...prevNewComments, [eventId]: '' }));

        setIsSubmitting(prev => ({ ...prev, [eventId]: false })); 
    };

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <div className="moderator-management-container">
         
            <nav className="moderator-navbar">
                <h2>Welcome, {userName}</h2>
                
                <button className="profile-button" onClick={() => navigate('/ModeratorProfile')}>Profile</button>
                <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
            </nav>

        
            <div className="moderator-content">
                <aside className="sidebar">
                    <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorHomePage">Feed</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>

                <div className="event-feed">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="event-card">
                            <h3>{event.name}</h3>
                            <p>{event.description}</p>
                            <h4>Likes: {event.likesCount}</h4>
                          
                            {event.images && event.images.length > 0 && (
                                <div className="event-images">
                                    {event.images.map((img, idx) => (
                                        <img key={idx} src={img} alt={`Event ${idx + 1}`} />
                                    ))}
                                </div>
                            )}
                            <button className="like-buttonn" onClick={() => handleLike(event.id)} disabled={likes[event.id]}>
                                {likes[event.id] ? 'Liked' : 'Like'}
                            </button>
                            <button className="unlike-buttonn" onClick={() => handleUnlike(event.id)} disabled={likes[event.id]}>
                                Unlike
                            </button>
                         

                          
                            <div className="comments-section">
                                <h4>Comments</h4>
                                <ul>
                                    {(comments[event.id] || []).map((comment, idx) => (
                                        <li key={comment.createdAt}> 
                                            <strong>{comment.userNameBy}</strong>: {comment.text}
                                        </li>
                                    ))}
                                </ul>
                                <form onSubmit={(e) => handleCommentSubmit(event.id, e)}>
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={newComments[event.id] || ''}
                                        onChange={(e) => setNewComments(prev => ({
                                            ...prev,
                                            [event.id]: e.target.value
                                        }))}
                                    />
                                    <button className="comment-buttonn" type="submit" disabled={isSubmitting[event.id]}>
                                        {isSubmitting[event.id] ? 'Submitting...' : 'Post'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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

export default ModeratorHomePage;
