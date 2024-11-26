import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { firestore, auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';

import './reportContent.css';

const ReportContent = () => {
    const { reporterId, eventId, commentId, commenterId } = useParams();
    const currentUser = auth.currentUser;
    const navigate = useNavigate();
    const [currentUserName, setCurrentUserName] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventCreator, setEventCreator] = useState('');
    const [creatorName, setCreatorName] = useState('');
    const [commenter, setCommenter] = useState('');
    const [commenterName, setCommenterName] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    
    const fetchUserName = async (userId) => {
        try {
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            if (userDoc.exists()) {
                return userDoc.data().firstName || 'Unknown User';
            } else {
                return 'Unknown User';
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            return 'Unknown User';
        }
    };

    useEffect(() => {
      
        const fetchCurrentUserName = async () => {
            if (currentUser?.uid) {
                const name = await fetchUserName(currentUser.uid);
                setCurrentUserName(name);
            }
        };

      
        const fetchEventDetails = async () => {
            if (eventId) {
                try {
                    const eventDoc = await getDoc(doc(firestore, 'events', eventId));
                    if (eventDoc.exists()) {
                        const eventData = eventDoc.data();
                        setEventName(eventData.name || 'Unnamed Event');
                        const creator = eventData.createdBy || 'Unknown User';
                        setEventCreator(creator);
                        const creatorDisplayName = await fetchUserName(creator); 
                        setCreatorName(creatorDisplayName);
                    } else {
                        setEventName('Event not found');
                    }
                } catch (error) {
                    console.error('Error fetching event details:', error);
                    setEventName('Error loading event');
                }
            }
        };

        const fetchCommentDetails = async () => {
            if (commentId) {
                try {
                    const commentDoc = await getDoc(doc(firestore, 'comments', commentId));
                    if (commentDoc.exists()) {
                        const commentData = commentDoc.data();
                        const commenterId = commentData.commentedBy || 'Unknown User';
                        setCommenter(commenterId);
                        const commenterDisplayName = await fetchUserName(commenterId); 
                        setCommenterName(commenterDisplayName);
                    } else {
                        setCommenter('Comment not found');
                    }
                } catch (error) {
                    console.error('Error fetching comment details:', error);
                    setCommenter('Error loading comment');
                }
            }
        };

        fetchCurrentUserName();
        if (eventId) fetchEventDetails();
        if (commentId) fetchCommentDetails();
    }, [currentUser?.uid, eventId, commentId]);

    const handleReport = async () => {
        if (!currentUser) {
            alert('You need to be logged in to report.');
            return;
        }

        if (!reason) {
            alert('Please select a reason for reporting.');
            return;
        }

        const reportData = {
            reporterId: currentUser.uid,
            reason,
            message: message || '',
            reportedAt: new Date().toISOString(),
        };

        if (eventId) {
            reportData.eventId = eventId;
            reportData.eventCreator = eventCreator;
        }

        if (commentId) {
            reportData.commentId = commentId;
            reportData.commenterId = commenterId;
        }

        try {
            setLoading(true);
            const reportsRef = collection(firestore, 'reports');
            const reportId = eventId ? `${eventId}_${currentUser.uid}` : `${commentId}_${currentUser.uid}`;
            await setDoc(doc(reportsRef, reportId), reportData);

            alert('Thank you for reporting.');
            navigate('/userhomepage');
        } catch (error) {
            console.error('Error reporting the content:', error);
            alert('Failed to report. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reportContent">
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                    Hi, {currentUserName || 'User'}
                </div>
                <button
                    className="logout-btn"
                    onClick={() => signOut(auth).then(() => navigate('/login'))}
                >
                    Logout
                </button>
            </nav>

            <aside className="reportContent-sidebar">
                <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
                <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
                <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
                <button className="btn btn-link" onClick={() => navigate('/followers')}>Followers</button>
                <button className="btn btn-link" onClick={() => navigate('/mySchedule')}>My Schedule</button>
                <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
            </aside>

            <div className="reportContent-container">
                <h1>Reported by: {currentUserName || 'User'}</h1>
                <h2>Report Content</h2>

                {eventId && (
                    <>
                        <p><strong>Event Name:</strong> {eventName}</p>
                        <p><strong>Event Created by:</strong> {creatorName}</p>
                    </>
                )}

                {commentId && (
                    <p><strong>Commented by:</strong> {commenterName}</p>
                )}

                <label htmlFor="reason">Select a reason for reporting:</label>
                <select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                >
                    <option value="">-- Select Reason --</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="other">Other</option>
                </select>

                <label htmlFor="message">Additional message (optional):</label>
                <textarea
                    id="message"
                    placeholder="Add any additional details (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    cols={50}
                />

                <button onClick={handleReport} disabled={loading || !reason}>
                    {loading ? 'Reporting...' : 'Submit Report'}
                </button>

                <button onClick={() => navigate('/userhomepage')}>Cancel</button>
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

export default ReportContent;
