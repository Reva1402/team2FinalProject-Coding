import React, { useState, useEffect } from 'react';
import { firestore } from './firebaseConfig';  
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';  
import { useNavigate } from 'react-router-dom'; 
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './Followers.css';

const FollowersPage = () => {
    const [users, setUsers] = useState([]);  
    const [followedUsers, setFollowedUsers] = useState([]);  
    const [followers, setFollowers] = useState([]);  
    const [searchQuery, setSearchQuery] = useState('');  
    const navigate = useNavigate();
    const user = auth.currentUser; 
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (user) {
            setUserName(user.firstName);
            
            fetchUsers();
            fetchFollowedUsers();
            fetchFollowers();
        }
    }, [user]);

   
    const fetchUsers = async () => {
        try {
            const usersRef = collection(firestore, 'users');
            const snapshot = await getDocs(usersRef);
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    
    const fetchFollowedUsers = async () => {
        if (!user) return;
        try {
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            const data = userDoc.data();
            if (data && data.following) {
                setFollowedUsers(data.following);  
            }
        } catch (error) {
            console.error('Error fetching followed users:', error);
        }
    };

    
    const fetchFollowers = async () => {
        if (!user) return;
        try {
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            const data = userDoc.data();
            if (data && data.followers) {
                setFollowers(data.followers); 
            }
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };

  
    const handleFollow = async (userId) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, {
                followers: arrayUnion(user.uid)
            });

            const currentUserRef = doc(firestore, 'users', user.uid);
            await updateDoc(currentUserRef, {
                following: arrayUnion(userId)
            });

            fetchFollowedUsers();
            fetchFollowers();
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    
    const handleUnfollow = async (userId) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, {
                followers: arrayRemove(user.uid)
            });

            const currentUserRef = doc(firestore, 'users', user.uid);
            await updateDoc(currentUserRef, {
                following: arrayRemove(userId)
            });

            fetchFollowedUsers();
            fetchFollowers();
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

   
    const handleSearch = () => {
        console.log("Search Query:", searchQuery);
    };

    return (
        <div className="followerpage-page">
            <nav className="followerpage-navbar">
                <div className="followerpage-navbar-brand" onClick={() => navigate('/userhomepage')}>
                    Hi, {userName || 'User'}
                </div>
                {userName !== 'Guest' && (
                    <button
                        className="followerpage-logout-btn"
                        onClick={() => signOut(auth).then(() => navigate('/login'))}
                    >
                        Logout
                    </button>
                )}
            </nav>

            <aside className="followerpage-sidebar">
                <button className="followerpage-sidebar-link" onClick={() => navigate('/UserProfile')}>
                    Profile
                </button>
                <button className="followerpage-sidebar-link" onClick={() => navigate('/createevent')}>
                    Post An Event
                </button>
                <button className="followerpage-sidebar-link" onClick={() => navigate('/MyEvents')}>
                    My Events
                </button>
                <button className="followerpage-sidebar-link" onClick={() => navigate('/followers')}>
                    Followers
                </button>
                <button className="followerpage-sidebar-link" onClick={() => navigate('/mySchedule')}>
                    My Schedule
                </button>
                <button className="followerpage-sidebar-link" onClick={() => navigate('/filterEvents')}>
                    Filter Events
                </button>
            </aside>

            <h2 className="followerpage-heading">Followers & Following</h2>

            <div className="followerpage-user-list">
                <h3 className="followerpage-followers-heading">Followers</h3>
                <table className="followerpage-user-table">
                    <thead className="followerpage-table-head">
                        <tr>
                            <th className="followerpage-table-header">First Name</th>
                            <th className="followerpage-table-header">Email</th>
                            <th className="followerpage-table-header">Action</th>
                        </tr>
                    </thead>
                    <tbody className="followerpage-table-body">
                        {users.filter(user => followedUsers.includes(user.id)).map((user, index) => (
                            <tr key={index} className="followerpage-table-row">
                                <td className="followerpage-table-data">{user.firstName}</td>
                                <td className="followerpage-table-data">{user.email}</td>
                                <td className="followerpage-table-data">
                                    <button
                                        className="followerpage-unfollow-btn"
                                        onClick={() => handleUnfollow(user.id)}
                                    >
                                        Unfollow
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 className="followerpage-following-heading">Following</h3>
                <table className="followerpage-user-table">
                    <thead className="followerpage-table-head">
                        <tr>
                            <th className="followerpage-table-header">First Name</th>
                            <th className="followerpage-table-header">Email</th>
                            <th className="followerpage-table-header">Action</th>
                        </tr>
                    </thead>
                    <tbody className="followerpage-table-body">
                        {users.filter(user => followers.includes(user.id)).map((user, index) => (
                            <tr key={index} className="followerpage-table-row">
                                <td className="followerpage-table-data">{user.firstName}</td>
                                <td className="followerpage-table-data">{user.email}</td>
                                <td className="followerpage-table-data">
                                    {followedUsers.includes(user.id) ? (
                                        <button
                                            className="followerpage-unfollow-btn"
                                            onClick={() => handleUnfollow(user.id)}
                                        >
                                            Unfollow
                                        </button>
                                    ) : (
                                        <button
                                            className="followerpage-follow-btn"
                                            onClick={() => handleFollow(user.id)}
                                        >
                                            Follow
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="followerpage-footer">
                <ul className="followerpage-footer-links">
                    <li
                        className="followerpage-footer-link"
                        onClick={() => navigate('/about')}
                    >
                        About
                    </li>
                    <li
                        className="followerpage-footer-link"
                        onClick={() => navigate('/privacypolicy')}
                    >
                        Privacy Policy
                    </li>
                    <li
                        className="followerpage-footer-link"
                        onClick={() => navigate('/termsandconditions')}
                    >
                        Terms and Conditions
                    </li>
                    <li
                        className="followerpage-footer-link"
                        onClick={() => navigate('/contactus')}
                    >
                        Contact Us
                    </li>
                </ul>
            </footer>
        </div>
    );
};

export default FollowersPage;
