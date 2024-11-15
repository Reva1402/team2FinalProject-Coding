import React, { useEffect, useState } from "react";
import { firestore } from "./firebaseConfig";
import { collection, onSnapshot, updateDoc, deleteDoc, addDoc, doc , getDoc} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import "./UserManagement.css";

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "" });
    const [searchQuery, setSearchQuery] = useState("");

    const adminEmail = "madhavjariwala55@gmail.com";  // Admin's email

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, "users"), (snapshot) => {
            const usersData = [];
            snapshot.forEach((doc) => usersData.push({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
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

    const handleSearch = () => {
        if (searchQuery.trim() === "") {
            alert("Please enter a search term.");
        } else {
            console.log("Searching for:", searchQuery);
        }
    };

    const checkIfAdmin = () => {
        const currentUser = auth.currentUser;
        return currentUser && currentUser.email === adminEmail;
    };

    // Change User's Role to Moderator
    const changeUserRoleToModerator = async (userId) => {
        try {
            const isConfirmed = window.confirm('Are you sure you want to change this user\'s role to moderator?');
            if (isConfirmed) {
                // Get the current authenticated user
                const user = auth.currentUser;
    
                // Ensure the user is an admin by checking the role field from Firestore
                const userDocRef = doc(firestore, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();
    
                // Check if the current user is an admin
                if (userData.role !== "admin") {
                    alert("You are not authorized to change user roles.");
                    return;
                }
    
                // Proceed with the role change if the user is an admin
                const targetUserDocRef = doc(firestore, "users", userId);
                await updateDoc(targetUserDocRef, {
                    role: 'moderator'  // Update the user's role field to 'moderator'
                });
    
                alert("User role changed to moderator successfully!");
            }
        } catch (err) {
            console.error("Error changing role:", err);
            alert(`Failed to change user role. Error: ${err.message}`);
        }
    };
    
    const suspendUser = async (userId) => {
        if (!checkIfAdmin()) {
            alert("You are not authorized to suspend users.");
            return;
        }
    
        try {
            // Update the user's status to suspended in Firestore
            await updateDoc(doc(firestore, "users", userId), { status: "suspended" });
            alert("User suspended successfully!");
        } catch (error) {
            console.error("Error suspending user:", error);
            alert("Failed to suspend the user. Please try again.");
        }
    };

    const activateUser = async (userId) => {
        if (!checkIfAdmin()) {
            alert("You are not authorized to activate users.");
            return;
        }
    
        try {
            // Update the user's status to active in Firestore
            await updateDoc(doc(firestore, "users", userId), { status: "active" });
            alert("User activated successfully!");
        } catch (error) {
            console.error("Error activating user:", error);
            alert("Failed to activate the user. Please try again.");
        }
    };


const deleteUser = async (userId) => {
  try {
    
    const isAdmin = await checkIfAdmin();
    if (!isAdmin) {
      alert("You are not authorized to delete users.");
      return;
    }

  
    const userDocRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();

     
      if (userData.role === "admin") {
        alert("You cannot delete an admin user.");
        return;
      }
    }

    
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (!isConfirmed) return;

   
    await deleteDoc(userDocRef);
    alert("User deleted successfully!");

  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Failed to delete the user. Please try again.");
  }
};

    const handleAddUser = async () => {
        if (!checkIfAdmin()) {
            alert("You are not authorized to add users.");
            return;
        }
        await addDoc(collection(firestore, "users"), {
            username: formData.username,
            email: formData.email,
            status: "active",
        });
        setFormData({ username: "", email: "" });
        alert("User added successfully!");
    };

    
// Filter users for User Management view
const filteredUsers = users.filter(user => {
    const username = user.username || "";
    const email = user.email || "";
    const query = searchQuery.toLowerCase().trim();

    // Exclude users with the role of "moderator"
    return (
        user.role !== "moderator" &&  // Exclude moderators
        (username.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query))
    );
});


    return (
        <div className="admin-dashboard">
            {/* <header className="navbar">
                <h1> Welcome to the Admin Portal </h1>
                <nav>
                    <Link to="/profile">Profile</Link>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                </nav>
            </header> */}

            <div className="user-management-sidebar">
                <Link to="/users">User Management</Link>
                <Link to="/ModeratorManagement">Moderator Management</Link>
                <Link to="/suspendedresources">Suspended Resources</Link>
                <Link to="/contentmanagement">Content Management</Link>
                <Link to="/securityrules">Security Rules</Link>
            </div>

            <div className="user-management">
                
                <div className="user-actions" style={{ top: "10000px" }}>
                    <button className="add-user-btn" onClick={handleAddUser}>Add User</button>
                </div>

                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.status}</td>
                                <td>
                                    <button onClick={() => changeUserRoleToModerator(user.id)}>Change Role to Moderator</button>
                                    {user.status !== "suspended" ? (
    <button onClick={() => suspendUser(user.id)}>Suspend</button>
) : (
    <button onClick={() => activateUser(user.id)}>Activate User</button> // Change suspend to activate when suspended
)}
                                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="footer">
                <p>About</p>
                <p>Privacy Policy</p>
                <p>Terms and Conditions</p>
                <p>Contact Us</p>
            </footer>
        </div>
    );
};

export default UserManagement;
