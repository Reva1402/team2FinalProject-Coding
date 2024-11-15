import React, { useState, useEffect } from 'react';
import { firestore } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ModeratorCommentManagement = () => {
    const [reportedComments, setReportedComments] = useState([]);

    useEffect(() => {
        fetchReportedComments();
    }, []);

    const fetchReportedComments = async () => {
        try {
            const reportsRef = collection(firestore, 'reports');
            const snapshot = await getDocs(reportsRef);
            const commentsList = snapshot.docs
                .map(doc => doc.data())
                .filter(report => report.commenterId) // Only select comments that have a commenterId
                .map(report => ({
                    commentId: report.commentId,
                    comment: report.message,
                    commenterId: report.commenterId,
                    reason: report.reason,
                    reportedAt: report.reportedAt,
                }));

            setReportedComments(commentsList);
        } catch (error) {
            console.error('Error fetching reported comments:', error);
        }
    };

    const suspendComment = async (id) => {
        // Implement suspend comment logic here
        console.log(`Suspend comment with id: ${id}`);
    };

    const deleteComment = async (id) => {
        // Implement delete comment logic here
        console.log(`Delete comment with id: ${id}`);
    };

    return (
        <div className="moderator-management-container">
            <h2>Reported Comments</h2>
            <div>
                <aside className="sidebar">
                    <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>
            </div>
            <table className="moderator-table">
                <thead>
                    <tr>
                        <th>Comment</th>
                        <th>Commenter ID</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reportedComments.map(comment => (
                        <tr key={comment.commentId}>
                            <td>{comment.comment}</td>
                            <td>{comment.commenterId}</td>
                            <td className="action-buttons">
                                <button onClick={() => suspendComment(comment.commentId)}>Suspend</button>
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
