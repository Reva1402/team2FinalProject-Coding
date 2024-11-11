// src/UserManagement.js
import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  
  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(db, "users");
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  
  const handleView = (userId) => {
    alert(`Viewing user ${userId}`);
  };

  const handleEdit = (userId) => {
    alert(`Editing user ${userId}`);
  };

  const handlePromote = async (userId) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: "Promoted" });
    alert("User promoted!");
  };

  const handleSuspend = async (userId) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { status: "Suspended" });
    alert("User suspended!");
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((user) => user.id !== userId)); 
      alert("User deleted!");
    }
  };

  return (
    <div className="admin-container">
      <h1>User Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>User Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleView(user.id)} className="action-button view-button">View</button>
                <button onClick={() => handleEdit(user.id)} className="action-button edit-button">Edit</button>
                <button onClick={() => handlePromote(user.id)} className="action-button promote-button">Promote</button>
                <button onClick={() => handleSuspend(user.id)} className="action-button suspend-button">Suspend</button>
                <button onClick={() => handleDelete(user.id)} className="action-button delete-button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
