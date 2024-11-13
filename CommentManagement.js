import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from './firebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import { Link } from 'react-router-dom';

import './Commentstyle.css';

const CommentManagement = ({ eventId }) => {
    const [comments, setComments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const commentsRef = ref(database, `events/${eventId}/comments`);

        const unsubscribe = onValue(commentsRef, (snapshot) => {
            const commentsData = snapshot.val();
            const commentsList = commentsData
                ? Object.keys(commentsData).map(id => ({
                    id,
                    ...commentsData[id]
                }))
                : [];
            setComments(commentsList);
        });

        return () => unsubscribe();
    }, [eventId]);

    const handleView = (commentId) => {
        console.log('Viewing comment:', commentId);
    };

    const handleWarning = (commentId) => {
        console.log('Warning issued for:', commentId);
    };

    const handleRemove = (commentId) => {
        const commentRef = ref(database, `events/${eventId}/comments/${commentId}`);
        remove(commentRef);
        console.log('Comment removed:', commentId);
    };

    const handleSuspend = (commentId) => {
        console.log('Comment suspended:', commentId);
    };

    return (
        <div className="comment-management-container">
            {/* Header */}
            <nav className="comment-navbar">
                <div className="nav-left">
                    <h1>Moderator One</h1>
                </div>
                <div className="nav-right">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button className="profile-btn" onClick={() => navigate('/ModeratorProfile')}>
                        Profile
                    </button>
                    <button className="logout-btn" onClick={() => navigate('/login')}>
                        Log Out
                    </button>
                </div>
            </nav>

            {/* Main Content Area with Sidebar and Comments Table */}
            <div className="main-content">
                {/* Sidebar */}
                <div className="sidebar">
                    <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/user">User Management</Link></li>
                        <li><Link to="/event">Event Management</Link></li>
                        <li><Link to="/CommentManagement">Comment Management</Link></li>
                    </ul>
                </div>

                {/* Comment Management Table */}
                <div className="comment-management-content">
                    <h2>Comments</h2>
                    {comments.length === 0 ? (
                        <p>No comments available for this event.</p>
                    ) : (
                        <table className="comment-table">
                            <thead>
                                <tr>
                                    <th>Comment ID</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.map(comment => (
                                    <tr key={comment.id}>
                                        <td>{comment.id}</td>
                                        <td>
                                            <button onClick={() => handleView(comment.id)} className="view-btn">View</button>
                                            <button onClick={() => handleWarning(comment.id)} className="warning-btn">Warning</button>
                                            <button onClick={() => handleSuspend(comment.id)} className="suspend-btn">Suspend</button>
                                            <button onClick={() => handleRemove(comment.id)} className="remove-btn">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="moderator-footer">
                <p>About</p>
                <p>Privacy Policy</p>
                <p>Terms and Conditions</p>
                <p>Contact Us</p>
            </footer>
        </div>
    );
};

export default CommentManagement;
