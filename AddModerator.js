import React, { useState } from "react";
import { firestore } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AddModerator.css";

const AddModerator = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("Active");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await addDoc(collection(firestore, "users"), {
                "Moderator Email": email,
                "Moderator Status": status,
                role: "Moderator" 
            });

            alert("Moderator added successfully!");
            navigate("/moderator-management");
        } catch (error) {
            console.error("Error adding moderator:", error.message);
            alert("Failed to add moderator. Please try again.");
        }
    };

    return (
        <div className="add-moderator">
            <h2 className="form-title">Add New Moderator</h2>
            <form onSubmit={handleSubmit} className="moderator-form">
                <label className="form-label">
                    Moderator Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                    />
                </label>
                <label className="form-label">
                    Moderator Status:
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </label>
                <button type="submit" className="submit-button">Add Moderator</button>
            </form>
        </div>
    );
};

export default AddModerator;