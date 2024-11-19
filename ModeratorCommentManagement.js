import React, { useState, useEffect } from 'react';
import { firestore } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';



const ModeratorCommentManagement = () => {
    const [reportedComments, setReportedComments] = useState([]);
    const [usersData, setUsersData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        
        const fetchReportedComments = () => {
            const reportsRef = collection(firestore, 'reports');
            
            
            const unsubscribe = onSnapshot(reportsRef, snapshot => {
                const commentsList = snapshot.docs
                    .map(doc => doc.data())
                    .filter(report => report.commenterId) 
                    .map(report => ({
                        commentId: doc.id, 
                        comment: report.message,
                        commenterId: report.commenterId,
                        reason: report.reason,
                        reportedAt: report.reportedAt,
                        suspended: report.suspended || false, 
                    }));

               
                fetchUserNames(commentsList);
            });

           
            return unsubscribe;
        };

       
        const fetchUserNames = async (commentsList) => {
            const usersRef = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersRef);

            const users = usersSnapshot.docs.reduce((acc, doc) => {
                const userData = doc.data();
                acc[doc.id] = userData.firstName || 'Unknown'; 
                return acc;
            }, {});

            const updatedCommentsList = commentsList.map(comment => ({
                ...comment,
                commenterFirstName: users[comment.commenterId] || 'Unknown', 
            }));

            setReportedComments(updatedCommentsList);
        };

        const unsubscribe = fetchReportedComments();
        
      
        return () => unsubscribe();
    }, []);
    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );



    const deleteComment = async (commentId) => {
        const confirmation = window.confirm('Are you sure you want to delete this comment?');
        
        if (confirmation) {
          try {
          
            console.log('Deleting comment with ID:', commentId);
            
            if (!commentId) {
              throw new Error('Comment ID is missing.');
            }
      
          
            const eventCommentRef = doc(firestore, 'events', commentId); 
            const reportCommentRef = doc(firestore, 'reports', commentId); 
      
            
            await deleteDoc(eventCommentRef);
            await deleteDoc(reportCommentRef);
      
           
            alert('Comment has been deleted from both the event and reports collections.');
          } catch (error) {
            
            console.error('Error deleting comment:', error);
            alert('Failed to delete the comment. Please try again later.');
          }
        } else {
          console.log('Comment deletion was canceled');
        }
      };
      

    return (
        <div className="moderator-management-container">
           
             <nav className="moderator-navbar">
                <h2>Welcome, </h2>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => navigate('/ModeratorProfile')}>Profile</button>
                <button onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
            </nav>
            <h2>Reported Comments</h2>
            <div>
                <aside className="sidebar">
                <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorHomePage">Feed</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>
            </div>
            <table className="moderator-table">
                <thead>
                    <tr>
                        <th>Comment</th>
                        <th>Commenter First Name</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reportedComments.map(comment => (
                        <tr key={comment.commentId}>
                            <td>{comment.comment}</td>
                            <td>{comment.commenterFirstName}</td> 
                            <td>{comment.reason}</td>
                            <td className="action-buttons">
                             
                                <button onClick={() => deleteComment(comment.commentId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ModeratorCommentManagement;
