import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import "./Header.css";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleSearch = () => {
        
        console.log("Search for:", searchQuery);
    };

    return (
        <header className="navbar">
            <h1>Welcome to the Admin</h1>
            <nav>
                <Link to="/profile">Profile</Link>
                <div className="header-search">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" onClick={handleSearch}>Search</button>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </nav>
        </header>
    );
};

export default Header;
