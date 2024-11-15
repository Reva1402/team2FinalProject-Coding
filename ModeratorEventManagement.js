import React, { useState, useEffect } from 'react';
import { firestore } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ModeratorEventManagement = () => {
    const [reportedEvents, setReportedEvents] = useState([]);
    const [reportedEventCreators, setReportedEventCreators] = useState([]);

    useEffect(() => {
        fetchReportedEvents();
    }, []);

    const fetchReportedEvents = async () => {
        try {
            const reportsRef = collection(firestore, 'reports');
            const snapshot = await getDocs(reportsRef);
            const eventsList = snapshot.docs
                .map(doc => doc.data())
                .filter(report => report.eventCreator) // Filter for event reports only
                .map(report => ({
                    eventId: report.eventId,
                    eventName: report.eventName,
                    eventCreator: report.eventCreator,
                }));

            const eventCreators = eventsList.map(event => event.eventCreator); // Get the event creators (user IDs)

            setReportedEvents(eventsList);
            setReportedEventCreators([...new Set(eventCreators)]); // Remove duplicates
        } catch (error) {
            console.error('Error fetching reported events:', error);
        }
    };

    const suspendEvent = async (id) => {
        // Implement suspend event logic here
        console.log(`Suspend event with id: ${id}`);
    };

    const deleteEvent = async (id) => {
        // Implement delete event logic here
        console.log(`Delete event with id: ${id}`);
    };

    return (
        <div className="moderator-management-container">
            <h2>Reported Events</h2>
            <div>
                <aside className="sidebar">
                    <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>
            </div>
            <table className="moderator-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Event Creator (User ID)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reportedEvents.map(event => (
                        <tr key={event.eventId}>
                            <td>{event.eventName}</td>
                            <td>{event.eventCreator}</td>
                            <td className="action-buttons">
                                <button onClick={() => suspendEvent(event.eventId)}>Suspend</button>
                                <button onClick={() => deleteEvent(event.eventId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ModeratorEventManagement;
