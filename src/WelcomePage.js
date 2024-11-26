import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {  auth, firestore } from './firebaseConfig';
import './WelcomePage.css';
import { ref, doc, setDoc, getDoc } from 'firebase/firestore';
import bgimage from './images/bgimage.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';


const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobilenumber: '',
        password: '',
        confirmPassword: '',
        gender: '',
        dateofbirth: '',
        role: 'user',
        address: '',
        country: '',
        province: '',
        profilepicture: ''
    });

    const [provinces, setProvinces] = useState([]);
    const [error, setError] = useState('');
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
            setProvinces([
                'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
                'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'
            ]);
        } else if (country === 'USA') {
            setProvinces([
                'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania'
            ]);
        } else {
            setProvinces([]);
        }
    };

    const validateMobileNumber = (mobilenumber) => {
        const mobilePattern = /^[1-9][0-9]{9}$/;


        return mobilePattern.test(mobilenumber);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.mobilenumber
            || !formData.gender || !formData.role || !formData.address || !formData.country || !formData.province
            || !formData.dateofbirth) {
            setError('Please fill all required fields.');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailPattern.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!validateMobileNumber(formData.mobilenumber)) {
            setError('Mobile number must be 10 digits and should not start with 0.');
            alert('Not a valid mobile number.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                mobilenumber: '',
                password: '',
                confirmPassword: '',
                gender: '',
                dateofbirth: '',

                address: '',
                country: '',
                province: '',
                profilepicture: ''
            });
            return;
        }

        if (!isPasswordValid(formData.password)) {
            setError('Password must be at least 8 characters long, contain a digit, and a special character.');
            alert('Password must be at least 8 characters long, contain a digit, and a special character.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            alert('Passwords do not match, Signup failed.');
            return;
        }

        const today = new Date();
        const birthDate = new Date(formData.dateofbirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate()))

            if (age < 18 || age >= 80) {
                setError('You must be between 18 and 80 years old to create an account.');
                alert('You must be between 18 and 80 years old to create an account.');
                return;
            }

        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            await setDoc(doc(firestore, 'users/' + user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobilenumber: formData.mobilenumber,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                gender: formData.gender,
                role: formData.role,
                dateofbirth: formData.dateofbirth,
                address: formData.address,
                country: formData.country,
                province: formData.province,
                profilepicture: formData.profilepicture
            });

            console.log('User signed up and document created:', user);
            navigate('/login');
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Signup failed. Please try again.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                mobilenumber: '',
                password: '',
                confirmPassword: '',
                gender: '',
                dateofbirth: '',

                address: '',
                country: '',
                province: '',
                profilepicture: ''
            });
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
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

    const isPasswordValid = (password) => {
        const minLength = 8;
        const hasDigit = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        return (
            password.length >= minLength &&
            hasDigit.test(password) &&
            hasSpecialChar.test(password)
        );
    };

    return (
        <div>

            <nav className="welcome-navbar">
                <h1 className="navbar-brand" onClick={() => navigate('/')}>
                    Eventopia
                </h1>
                <ul className="navlinks">
                    {/* <li><button className="btnLink" onClick={() => navigate('/services')}>Services</button></li> */}
                    <li><button className="btnLink" onClick={handleLoginClick}>Login</button></li>
                    <li><button className="btnLink">
                        <i className="fas fa-phone" style={{ marginRight: '10px' }}></i>
                        +1 123 456 789
                    </button></li>
                </ul>
            </nav>

            <div className="bg-image">

            </div>
            <div className='bgText'>
                <h1>"Empowering Connections, <br></br>
                    Enriching Community Life"
                </h1>
                <br></br>
                <h3>Welcome to Community Events, where meaningful connections flourish.
                    Discover and engage in events that elevate our community—uniting us through shared experiences,
                    collaboration, and a commitment to fostering positive impact.</h3>

            </div>


            <div className="signup-container">
                <div className="form-wrapper">
                    <h1 className="text-center">Sign Up</h1>

                    <form onSubmit={handleSignup}>
                        <div className="form-group">

                            <input
                                type="text"
                                className="form-control"
                                placeholder='First Name'
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">

                            <input
                                type="text"
                                className="form-control"
                                name="lastName"
                                placeholder='Last Name'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">

                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder='Email'
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            
                            <input
                                type="tel"
                                className="form-control"
                                name="mobilenumber"
                                placeholder='Mobile Number'
                                value={formData.mobilenumber}
                                onChange={handleInputChange}
                                maxLength={10}

                              
                                required
                            />
                        </div>

                        <div className="form-group">
                            
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                placeholder='Password'
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                placeholder='Confirm Password'
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <div className="gender-group">
                                <input
                                    type="radio"
                                    id="male"
                                    name="gender"
                                    value="Male"
                                    checked={formData.gender === 'Male'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="male">Male</label>
                                <input
                                    type="radio"
                                    id="female"
                                    name="gender"
                                    value="Female"
                                    checked={formData.gender === 'Female'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="female">Female</label>
                                <input
                                    type="radio"
                                    id="custom"
                                    name="gender"
                                    value="Custom"
                                    checked={formData.gender === 'Custom'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="custom">Others</label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className="form-control"
                                name="dateofbirth"
                                value={formData.dateofbirth}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                           
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                placeholder='Address'
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Country</label>
                            <select
                                className="form-control"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="Canada">Canada</option>
                                <option value="USA">USA</option>
                            </select>
                        </div>

                        {formData.country && (
                            <div className="form-group">
                                <label>Province</label>
                                <select
                                    className="form-control"
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
                            </div>
                        )}

                        <div>
                            <label>Profile Picture</label>
                            <input
                                type="file"
                                name="profilepicture"
                                onChange={handleProfilePictureChange}
                            />
                        </div>

                        <div className="button-group-signup">
                            <button type="submit" className="signup-btn-custom">
                                Sign Up
                            </button>
                            <a className="accountBtn" onClick={() => navigate('/login')}>Already have an account?</a>
                        </div>
                    </form>
                </div>

            </div>
            <footer className="WelcomeFooter">
                <ul className="footerlinks">
                    <li onClick={() => navigate('/about')}>About</li>
                    <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                    <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                    <li onClick={() => navigate('/contactus')}>Contact Us</li>
                </ul>
            </footer>


        </div>



    );
};

export default SignupPage;
