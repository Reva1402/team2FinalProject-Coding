import React, { useEffect, useState } from "react";
import { firestore, auth } from "./firebaseConfig";
import { collection, onSnapshot, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "./Adminsupport.css";


const Adminsupport = () => {
    const [contacts, setContacts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
       
        const unsubscribe = onSnapshot(collection(firestore, "contacts"), (snapshot) => {
            const contactsData = [];
            snapshot.forEach((doc) => contactsData.push({ id: doc.id, ...doc.data() }));
            setContacts(contactsData);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const resolveContact = async (contactId) => {
        try {
            const contactRef = doc(firestore, "contacts", contactId);
            await updateDoc(contactRef, { status: 'resolved' });
            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact.id === contactId ? { ...contact, status: 'resolved' } : contact
                )
            );
            console.log('Contact status updated to resolved in Firestore');
        } catch (error) {
            console.error('Error resolving contact:', error);
        }
    };
    const deleteContact = async (contactId) => {
        try {
            const isConfirmed = window.confirm("Are you sure you want to delete this contact?");
            if (!isConfirmed) return;

            await deleteDoc(doc(firestore, "contacts", contactId));
            alert("Contact deleted successfully!");
        } catch (error) {
            console.error("Error deleting contact:", error);
            alert("Failed to delete the contact. Please try again.");
        }
    };

    return (
        <div className="adminsupportdashboard">
            <header className="adminsupportnavbar">
                <h1 onClick={() => navigate('/AdminDashboard')}>Welcome Admin</h1>
                <div className="navbarsupportright">
                    <Link to="/AdminProfile" className="profilesupportlink" style={{ color: "white" }}>Profile</Link>
                    <button className="logoutsupportbtn" onClick={handleLogout}>Log Out</button>
                </div>
            </header>

            <div className="usermanagementsidebarsupport">
                <Link to="/AdminDashboard">Dashboard</Link>
                <Link to="/users">User Management</Link>
                <Link to="/ModeratorManagement">Moderator Management</Link>
                <Link to="/suspendedresources">Suspended Resources</Link>
                <Link to="/Admincontentmanagement">Content Management</Link>
                <Link to="/Adminsupport">Support Management</Link>
                <h4>
    <a href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules" target="_blank" rel="noopener noreferrer">
      Security Rules
    </a>
  </h4>
            </div>

            <div className="usersupportmanagement">
                <h2>Contact Us Forms</h2>
                <table className="usersupporttable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(contact => (
                            <tr key={contact.id}>
                                <td>{contact.name || "N/A"}</td>
                                <td>{contact.email || "N/A"}</td>
                                <td>{contact.message || "No message provided"}</td>
                                <td>
                                    <span className={contact.status === 'resolved' ? "resolved-status" : "pending-status"}>
                                        {contact.status || "Pending"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => resolveContact(contact.id)}
                                        className={contact.status === 'resolved' ? "resolved" : "resolve-button"} 
                                    >
                                        {contact.status === 'resolved' ? "Resolved" : "Resolve"}
                                    </button>
                                    <button onClick={() => deleteContact(contact.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="supportfooter">
        <ul className="footersupportlinks">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
        </div>
    );
};

export default Adminsupport;
