import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, doc, getDocs, getDoc, updateDoc, arrayUnion, onSnapshot, arrayRemove, query, where } from 'firebase/firestore';

import { increment } from 'firebase/firestore';
import './UserHomePage.css';



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
    const [formattedDate, setFormattedDate] = useState('');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [userNow, setUserNow] = useState(null);
   
    const getLocationName = async (latitude, longitude) => {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAipP-PPc3YltY3nAZbGLFBuK-c2TrWXgY`;

        try {
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            if (data.status === 'OK') {
                return data.results[0]?.formatted_address || 'Unknown location';
            }
            return 'Location not found';
        } catch (error) {
            console.error("Error fetching location name:", error);
            return 'Error fetching location';
        }
    };



    useEffect(() => {
        const fetchUserData = async (userId) => {
            try {
                const userDoc = await getDoc(doc(firestore, 'users', userId));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().firstName || 'User');
                } else {
                    setUserName('User');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setUserName('User');
            }
        };

        const fetchEvents = async () => {
            if (!user) return;
        
            try {
                const eventsRef = collection(firestore, 'events');
                const q = query(eventsRef);
                
                const eventSnapshot = await getDocs(q);
                const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                const userEventList = eventList.filter(event => 
                    event.createdBy === user.uid || following.some(f => f.id === event.createdBy)
                );
        
                setEvents(userEventList);
        
                const userLikes = {};
                userEventList.forEach(event => {
                    if (event.likes && event.likes.includes(user.uid)) {
                        userLikes[event.id] = true;
                    }
                });
                setLikes(userLikes);
        
                const unsubscribeList = userEventList.map(event => {
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
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        
        const fetchUsers = async () => {
            try {
                const usersRef = collection(firestore, 'users');
                const userSnapshot = await getDocs(usersRef);
                const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(userList);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchEventsAndListeners = async () => {
            const unsubscribeList = await fetchEvents();
            return unsubscribeList;
        };

        const fetchUserDataAndEvents = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await fetchUserData(currentUser.uid);
                fetchEventsAndListeners().then(unsubscribeList => {
                    return () => {
                        unsubscribeList.forEach(unsubscribe => unsubscribe());
                    };
                });
    
                fetchFollowersAndFollowing(currentUser.uid);
            } else {
                setUserNow(null);
            }
        };
    
        fetchUserDataAndEvents();
        fetchUsers();
    
        const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
            if (currentUser) {
                fetchUserData(currentUser.uid);
            } else {
                setUserNow(null);
            }
        });
    
        return () => {
            unsubscribeAuth();
        };
    }, [user, following]);
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

    const followUser = async (targetUserId) => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return; 
        const userRef = doc(firestore, 'users', targetUserId);
        const currentUserRef = doc(firestore, 'users', currentUserId);

        try {
           
            await updateDoc(userRef, {
                followers: arrayUnion(currentUserId),
            });

            await updateDoc(currentUserRef, {
                following: arrayUnion(targetUserId),
            });

            console.log(`Successfully followed user: ${targetUserId}`);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const fetchFollowersAndFollowing = async (userId) => {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
    
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const followers = userData.followers || [];
            const following = userData.following || [];
    
            const followersDetails = await Promise.all(
                followers.map(async (uid) => {
                    const followerDoc = await getDoc(doc(firestore, 'users', uid));
                    return followerDoc.exists() ? { id: uid, ...followerDoc.data() } : null;
                })
            );
    
            const followingDetails = await Promise.all(
                following.map(async (uid) => {
                    const followingDoc = await getDoc(doc(firestore, 'users', uid));
                    return followingDoc.exists() ? { id: uid, ...followingDoc.data() } : null;
                })
            );
    
            setFollowers(followersDetails);
            setFollowing(followingDetails);
        }
    };
    


    return (
        <div className="unique-page-wrapper">
            <div className="homepage">
                <nav className="usernavbar">
                    <div className="usernavbar-brand" onClick={() => navigate('/userhomepage')}>
                        Hi, {userName || 'User'}
                    </div>
                    <input
                        type="text"
                        className="search-in"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="searbtn" onClick={handleSearch} >Search</button>

                    {userName !== 'Guest' && (
                        <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
                    )}
                </nav>

                <aside className="side">
                    <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
                    <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
                    <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
                    <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
                    <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
                    <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
                </aside>

                {searchQuery && (filteredEvents.length > 0 || filteredUsers.length > 0) && (
                    <div className="searchresults">
                        <h2>Search Results</h2>
                        {filteredEvents.length > 0 && (
                            <div>
                                <h3>Events:</h3>
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="searchevent-card" onClick={() => handleEventClick(event.id)}>
                                        <h4>{event.name}</h4>

                                    </div>
                                ))}
                            </div>
                        )}
                        {filteredUsers.length > 0 && (
                            <div>
                                <h3>Users:</h3>
                                {filteredUsers.map((user) => (
                                    <div key={user.id} className="usercard" onClick={() => handleUserClick(user.id)}>
                                        <h4>{user.firstName} {user.lastName}</h4>
                                        <li className="followbtn" onClick={() => followUser(user.id)}>Follow</li>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!searchQuery && (
                    <div className="usereventfeedContent">
                        <h2>Welcome to Eventopia</h2>
                        <p>Explore events, interact with the community, and stay connected!</p>

                        {events.length > 0 ? (
                            events.map(event => (
                                <div key={event.id} className="usereventcard">
                                    <h3>{event.name}</h3>
                                    <p>{event.description}</p>
                                    <p><strong>Date:</strong> {formattedDate}</p>
                                    <p>Location: {event.location}</p>
                                    <h4>Likes: {event.likesCount}</h4>

                                    {event.images && event.images.length > 0 && (
                                        <div className="userevent-images">
                                            {event.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`Event ${event.name} - Image ${index + 1}`}
                                                    className="userevent-image"
                                                />
                                            ))}
                                        </div>
                                    )}


                                    <button className="userlike-btn"
                                        onClick={() => handleLike(event.id)}
                                        disabled={likes[event.id]}
                                    >
                                        {likes[event.id] ? 'Liked' : 'Like'}
                                    </button>
                                    <button className="userunlike-btn" onClick={() => handleUnlike(event.id)} disabled={!likes[event.id]}>
                                        Unlike
                                    </button>

                                    <button className="user1report-btn" onClick={() => handleReportEvent(event.id)} disabled={reportedEvents[event.id]}>
                                        {reportedEvents[event.id] ? 'Reported' : 'Report Event'}
                                    </button>

                                    <button className="user1attend-btn" onClick={() => navigate(`/attendevent/${event.id}`)}>
                                        Attend Event
                                    </button>

                                    <div className="usercommentssection">
                                        <h4>Comments</h4>
                                        <ul className="usercomments-list">
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
                                                        <button className="userreport-comment"
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

                <footer className="userFooter">
                    <ul className="footerslinks">
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
