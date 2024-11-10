import React, { useState, useEffect } from 'react';
import {
    getModerators,
    viewModerator,
    editModerator,
    demoteModerator,
    suspendModerator,
    deleteModerator,
} from './moderatorService'; 
import './ModeratorManagement.css'; 

function ModeratorManagement() {
    const [moderators, setModerators] = useState([]);

    
    const fetchModerators = async () => {
        const data = await getModerators();
        setModerators(data);
    };

    useEffect(() => {
        fetchModerators(); 
    }, []);

    
    const handleDemote = async (id) => {
        await demoteModerator(id);
        fetchModerators(); 
    };

    const handleSuspend = async (id) => {
        await suspendModerator(id);
        fetchModerators(); 
    };

    const handleDelete = async (id) => {
        await deleteModerator(id);
        fetchModerators(); 
    };

    return (
        <div className="moderator-management-container">
            <h2 className="moderator-management-title">Moderator Management</h2>
            <table className="moderator-table">
                <thead>
                    <tr>
                        <th>User Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {moderators.map((moderator) => (
                        <tr key={moderator.id}>
                            <td>{moderator["Moderator Email"] || moderator.email}</td>
                            <td className="action-buttons">
                            <button className="view-button" onClick={() => viewModerator(moderator.id)}>View</button>
                            <button className="edit-button" onClick={() => editModerator(moderator.id)}>Edit</button>
                            <button className="demote-button" onClick={() => handleDemote(moderator.id)}>Demote</button>
                            <button className="suspend-button" onClick={() => handleSuspend(moderator.id)}>Suspend</button>
                            <button className="delete-button" onClick={() => handleDelete(moderator.id)}>Delete</button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
            <a href="/add-moderator" className="add-moderator-link">Add a Moderator</a>
        </div>
    );
}

export default ModeratorManagement;
