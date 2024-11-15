import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebaseConfig';  // Import both firestore and auth
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ModeratorUserManagement = () => {
    const [reportedUsers, setReportedUsers] = useState([]);
    const [usersData, setUsersData] = useState({}); // Store user data (firstName)

    useEffect(() => {
        fetchReportedUsers();
    }, []);

    // Fetch reported users from both events and comments
    const fetchReportedUsers = async () => {
        try {
            const eventReportsRef = collection(firestore, 'reports');
            const eventSnapshot = await getDocs(eventReportsRef);
            const eventReports = eventSnapshot.docs
                .map(doc => doc.data())
                .filter(report => report.eventCreator)  // Filter for event reports only
                .map(report => report.eventCreator);  // Extract event creator IDs

            const commentReportsRef = collection(firestore, 'reports');
            const commentSnapshot = await getDocs(commentReportsRef);
            const commentReports = commentSnapshot.docs
                .map(doc => doc.data())
                .filter(report => report.commenterId)  // Filter for comment reports only
                .map(report => report.commenterId);  // Extract commenter IDs

            // Combine both event creator and commenter IDs
            const allReportedUsers = [...new Set([...eventReports, ...commentReports])];
            fetchUserNames(allReportedUsers);  // Now fetch user names for these IDs
        } catch (error) {
            console.error('Error fetching reported users:', error);
        }
    };

    // Fetch users data (firstName) based on reported user IDs
    const fetchUserNames = async (userIds) => {
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        // Create a map of userId to firstName
        const users = usersSnapshot.docs.reduce((acc, doc) => {
            const userData = doc.data();
            acc[doc.id] = userData.firstName || 'Unknown'; // Default to 'Unknown' if firstName is missing
            return acc;
        }, {});

        // Update reported users with their firstName
        const updatedReportedUsers = userIds.map(userId => ({
            userId,
            firstName: users[userId] || 'Unknown', // Display first name
        }));

        setReportedUsers(updatedReportedUsers);  // Update state with the user data
    };

    // Check if the current user is a moderator
    const checkIfModerator = () => {
        const user = auth.currentUser;  // Get the current user
        return user && user.role === 'moderator'; 
    };

    const suspendUser = async (userId) => {
        if (!checkIfModerator()) {
            alert("You are not authorized to suspend users.");
            return;
        }
    
        try {
           
            await updateDoc(doc(firestore, "users", userId), { status: "suspended" });
            alert("User suspended successfully!");
        } catch (error) {
            console.error("Error suspending user:", error);
            alert("Failed to suspend the user. Please try again.");
        }
    };

    const activateUser = async (userId) => {
        if (!checkIfModerator()) {
            alert("You are not authorized to activate users.");
            console.log("You are not authorized to activate users.", "Your role is ", auth.currentUser.role);
            return;
        }
    
        try {
          
            await updateDoc(doc(firestore, "users", userId), { status: "active" });
            alert("User activated successfully!");
        } catch (error) {
            console.error("Error activating user:", error);
            alert("Failed to activate the user. Please try again.");
        }
    };

    const issueWarning = async (userId) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, { warnings: firestore.FieldValue.increment(1) }); // Increment warning count
            alert('Warning has been issued to the user.');
        } catch (error) {
            console.error('Error issuing warning:', error);
        }
    };

    const deleteUser = async (userId) => {
        const confirmation = window.confirm('Are you sure you want to delete this user?');
        if (confirmation) {
            try {
                const userRef = doc(firestore, 'users', userId);
                await deleteDoc(userRef);  // Delete the user document from Firestore
                alert('User has been deleted.');
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div className="moderator-management-container">
            <h2>Reported Users</h2>
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
                        <th>User Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reportedUsers.map((user, index) => (
                        <tr key={index}>
                            <td>{user.firstName}</td> {/* Display the first name */}
                            <td className="action-buttons">
                                <button className="view-button">View</button>
                                {user.status !== "suspended" ? (
                                    <button onClick={() => suspendUser(user.userId)}>Suspend</button>
                                ) : (
                                    <button onClick={() => activateUser(user.userId)}>Activate User</button> // Change suspend to activate when suspended
                                )}
                                <button className="warning-button" onClick={() => issueWarning(user.userId)}>Issue Warning</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ModeratorUserManagement;
