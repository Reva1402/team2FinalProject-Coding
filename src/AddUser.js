import React, { useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate , Link} from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { signOut } from "firebase/auth";
import './AddUser.css';

const AddUser = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobilenumber: '',
        password: '',
        gender: '',
        role: '',
        dateofbirth: '',
        address: '',
        country: '',
        province: '',
        profilepicture: '',
        status: '' ,
    });

    const [provinces, setProvinces] = useState([]);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
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
                    profilepicture: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobilenumber ||
            !formData.password || !formData.gender || !formData.dateofbirth || !formData.address ||
            !formData.country || !formData.province ) {
            alert('Please fill all required fields.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await addDoc(collection(firestore, "users"), {
                ...formData,
                role: "user", 
                status: "active"  
            });

            alert("User added successfully!");
            navigate("/users");
        } catch (error) {
            console.error("Error adding moderator:", error.message);
            alert("Failed to add User. Please try again.");
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
        <div className="add-user-container">
            <header className="add-user-navbar">
                <h1 onClick={() => navigate('/AdminDashboard')}>Admin One</h1>
                <div className="add-user-navbar-right">
                    <Link to="/AdminProfile" className="add-user-profile-link">Profile</Link>
                    <button className="add-user-logout-btn" onClick={handleLogout}>Log Out</button>
                </div>
            </header>
            <h2 className="add-user-form-title">Add a User</h2>
            <form onSubmit={handleSubmit} className="add-user-form">
                <label className="add-user-form-label">
                    First Name:
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Last Name:
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Mobile Number:
                    <input
                        type="number"
                        name="mobilenumber"
                        value={formData.mobilenumber}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Gender:
                    <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Custom">Custom</option>
                    </select>
                </label>

                <label className="add-user-form-label">
                    Date of Birth:
                    <input
                        type="date"
                        name="dateofbirth"
                        value={formData.dateofbirth}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Address:
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="add-user-form-label">
                    Country:
                    <select name="country" value={formData.country} onChange={handleInputChange} required>
                        <option value="">Select</option>
                        <option value="Canada">Canada</option>
                        <option value="USA">USA</option>
                    </select>
                </label>

                {formData.country && (
                    <label className="add-user-form-label">
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

                <label className="add-user-form-label">
                    Profile Picture:
                    <input
                        type="file"
                        name="profilepicture"
                        onChange={handleProfilePictureChange}
                    />
                </label>

                <button type="submit" className="add-user-submit-button">
                    Add User
                </button>
            </form>
            <footer className="add-user-footer">
                <ul className="add-user-footer-links">
                    <li onClick={() => navigate('/about')}>About</li>
                    <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                    <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                    <li onClick={() => navigate('/contactus')}>Contact Us</li>
                </ul>
            </footer>
        </div>
    );
};

export default AddUser;
