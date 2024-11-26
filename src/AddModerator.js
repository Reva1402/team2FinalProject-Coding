import React, { useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import './AddModerator.css';

const AddModerator = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobilenumber: '',
        password: '',
        gender: '',
        dateofbirth: '',
        address: '',
        country: '',
        province: '',
        profilepicture: '',
        status: '',
    });

    const [provinces, setProvinces] = useState([]);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (name === 'country') {
            handleCountryChange(value);
        }
    };

    const handleCountryChange = (country) => {
        if (country === 'Canada') {
            setProvinces(['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick']);
        } else if (country === 'USA') {
            setProvinces(['California', 'Texas', 'Florida', 'New York']);
        } else {
            setProvinces([]);
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({
                    ...formData,
                    profilepicture: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobilenumber ||
            !formData.password || !formData.gender || !formData.dateofbirth || !formData.address ||
            !formData.country || !formData.province) {
            alert('Please fill all required fields.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await addDoc(collection(firestore, "users"), {
                ...formData,
                role: "moderator",
                status: "active",
            });

            alert("Moderator added successfully!");
            navigate("/moderatormanagement");
        } catch (error) {
            console.error("Error adding moderator:", error.message);
            alert("Failed to add moderator. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <div className="add-moderator-container">
            <header className="add-moderator-navbar">
                <h1 className="add-moderator-header" onClick={() => navigate('/AdminDashboard')}>Admin One</h1>
                <div className="add-moderator-navbar-right">
                    <Link to="/AdminProfile" className="add-moderator-profile-link">Profile</Link>
                    <button className="add-moderator-logout-btn" onClick={handleLogout}>Log Out</button>
                </div>
            </header>
            <h2 className="add-moderator-form-title">Add New Moderator</h2>
            <form onSubmit={handleSubmit} className="add-moderator-form">
                <label className="add-moderator-form-label">
                    First Name:
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Last Name:
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Mobile Number:
                    <input
                        type="number"
                        name="mobilenumber"
                        value={formData.mobilenumber}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Gender:
                    <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Custom">Custom</option>
                    </select>
                </label>

                <label className="add-moderator-form-label">
                    Date of Birth:
                    <input
                        type="date"
                        name="dateofbirth"
                        value={formData.dateofbirth}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Address:
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-moderator-form-label">
                    Country:
                    <select name="country" value={formData.country} onChange={handleInputChange} required>
                        <option value="">Select</option>
                        <option value="Canada">Canada</option>
                        <option value="USA">USA</option>
                    </select>
                </label>

                {formData.country && (
                    <label className="add-moderator-form-label">
                        Province:
                        <select
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select</option>
                            {provinces.map((province, index) => (
                                <option key={index} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="add-moderator-form-label">
                    Profile Picture:
                    <input
                        type="file"
                        name="profilepicture"
                        onChange={handleProfilePictureChange}
                    />
                </label>

                <button type="submit" className="add-moderator-submit-button">
                    Add Moderator
                </button>
            </form>
            <footer className="add-moderator-footer">
                <ul className="add-moderator-footer-links">
                    <li onClick={() => navigate('/about')} className="add-moderator-footer-link">About</li>
                    <li onClick={() => navigate('/privacypolicy')} className="add-moderator-footer-link">Privacy Policy</li>
                    <li onClick={() => navigate('/termsandconditions')} className="add-moderator-footer-link">Terms and Conditions</li>
                    <li onClick={() => navigate('/contactus')} className="add-moderator-footer-link">Contact Us</li>
                </ul>
            </footer>
        </div>
    );
};

export default AddModerator;
