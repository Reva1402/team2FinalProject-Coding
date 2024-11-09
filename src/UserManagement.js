import React, { useEffect, useState } from "react";
import { firestore } from "./firebaseConfig"; 
import { collection, onSnapshot, updateDoc, deleteDoc, addDoc, doc } from "firebase/firestore"; 
import "./UserManagement.css"; 
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig"; 
import { signOut } from "firebase/auth";

const UserManagement = () => {
    const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null); 
  const [formData, setFormData] = useState({ username: "", email: "" });
  
  
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

  
  const viewUser = (user) => {
    setViewingUser(user); 
  };

  const editUser = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email });
  };

  const suspendUser = async (userId) => {
    await updateDoc(doc(firestore, "users", userId), { status: "suspended" });
    alert("User suspended successfully!"); 
  };

  const deleteUser = async (userId) => {
    await deleteDoc(doc(firestore, "users", userId));
    alert("User deleted successfully!"); 
  };

  const addUser = async () => {
    const username = prompt("Enter username:");
    const email = prompt("Enter email:");
    await addDoc(collection(firestore, "users"), {
      username,
      email,
      status: "active",
    });
    alert("User added successfully!"); 
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveUser = async (userId) => {
    await updateDoc(doc(firestore, "users", userId), {
      username: formData.username,
      email: formData.email,
    });
    setEditingUser(null); 
    alert("User updated successfully!"); 
  };

  return (
    <div className="admin-dashboard">
      
    <header className="navbar">
      <h1> Welcome to the Admin Portal </h1>
      <nav>
        <Link to="/profile">Profile</Link>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </nav>
    </header>
    
    <div className="user-management">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>User Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => viewUser(user)}>View</button>
                <button onClick={() => editUser(user)}>Edit</button>
                <button onClick={() => suspendUser(user.id)}>Suspend</button>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      
      {editingUser && (
        <div className="edit-user-modal">
          <h3>Edit User</h3>
          <form onSubmit={(e) => { e.preventDefault(); saveUser(editingUser.id); }}>
            <div>
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleEditChange}
                required
              />
            </div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
          </form>
        </div>
      )}

    
      {viewingUser && (
        <div className="view-user-modal">
          <h3>User Details</h3>
          <p><strong>Username:</strong> {viewingUser.username}</p>
          <p><strong>Email:</strong> {viewingUser.email}</p>
          <p><strong>Status:</strong> {viewingUser.status}</p>
          <button onClick={() => setViewingUser(null)}>Close</button>
        </div>
      )}

      <p onClick={addUser} className="add-user-link">Add a user</p>
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