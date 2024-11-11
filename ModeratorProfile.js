import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import './ModeratorProfile.css';

const ModeratorProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'moderator',
        joinDate: '',
        actionsThisMonth: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate('/moderatorlogin');
                return;
            }

            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    setProfile({
                        ...userDoc.data(),
                        email: user.email
                    });
                    setEditedProfile({
                        ...userDoc.data(),
                        email: user.email
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditedProfile({...profile});
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const user = auth.currentUser;
            await updateDoc(doc(firestore, 'users', user.uid), {
                firstName: editedProfile.firstName,
                lastName: editedProfile.lastName,
                phone: editedProfile.phone
            });
            setProfile(editedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete your moderator profile? This action cannot be undone."
        );

        if (isConfirmed) {
            try {
                const user = auth.currentUser;
                
                // Delete user document from Firestore
                await deleteDoc(doc(firestore, 'users', user.uid));
                
                // Delete user authentication account
                await user.delete();
                
                // Navigate to login page
                navigate('/login');
            } catch (error) {
                console.error("Error deleting profile:", error);
                alert("Failed to delete profile. Please try again.");
            }
        }
    };

    return (
        <div className="moderator-profile">
            <div className="profile-header">
                <h1>Moderator Profile</h1>
                <div className="profile-actions">
                    <button 
                        className={`edit-button ${isEditing ? 'save' : ''}`}
                        onClick={isEditing ? handleSave : handleEditToggle}
                    >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                    <button 
                        className="delete-button"
                        onClick={handleDelete}
                    >
                        Delete Profile
                    </button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section personal-info">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>First Name</label>
                            {isEditing ? (
                                <input
                                    name="firstName"
                                    value={editedProfile.firstName || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p>{profile.firstName}</p>
                            )}
                        </div>
                        <div className="info-item">
                            <label>Last Name</label>
                            {isEditing ? (
                                <input
                                    name="lastName"
                                    value={editedProfile.lastName || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p>{profile.lastName}</p>
                            )}
                        </div>
                        <div className="info-item">
                            <label>Email</label>
                            <p>{profile.email}</p>
                        </div>
                        <div className="info-item">
                            <label>Phone</label>
                            {isEditing ? (
                                <input
                                    name="phone"
                                    value={editedProfile.phone || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p>{profile.phone}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-section moderation-stats">
                    <h2>Moderation Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <label>Role</label>
                            <p>{profile.role}</p>
                        </div>
                        <div className="stat-item">
                            <label>Join Date</label>
                            <p>{profile.joinDate}</p>
                        </div>
                        <div className="stat-item">
                            <label>Actions This Month</label>
                            <p>{profile.actionsThisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeratorProfile; 
