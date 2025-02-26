import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [todayTopic, setTodayTopic] = useState(null);
    const [error, setError] = useState('');
    const [timetable, setTimetable] = useState([]);

    // Fetch today's topic and timetable
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the timetable
                const response = await axios.get('http://localhost:5000/generate-timetable');
                setTimetable(response.data);

                // Get today's date
                const today = new Date().toISOString().split('T')[0];

                // Find today's topic
                const todayEntry = response.data.find((entry) => entry.date === today);
                if (todayEntry && todayEntry.type === 'Class') {
                    setTodayTopic(todayEntry);
                }
            } catch (err) {
                setError('Failed to fetch timetable.');
                console.error('Error:', err);
            }
        };

        fetchData();
    }, []);

    // Handle user confirmation
    const handleConfirmation = async (isAccomplished) => {
        try {
            if (!isAccomplished && todayTopic) {
                // Reschedule the missed topic
                const response = await axios.post('http://localhost:5000/reschedule-topic', {
                    missedDate: todayTopic.date,
                    topic: todayTopic.details,
                });

                if (response.status === 200) {
                    alert('Topic rescheduled successfully!');
                    setTimetable(response.data.updatedTimetable);
                }
            } else {
                alert('Topic marked as accomplished.');
            }
        } catch (err) {
            setError('Failed to reschedule topic.');
            console.error('Error:', err);
        }
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Course Planning Dashboard</h1>
            </header>

            <div className="dashboard-grid">
                <section className="today-card">
                    {todayTopic ? (
                        <>
                            <h2>Today's Topic</h2>
                            <div className="today-content">
                                <div className="topic-info">
                                    <p className="date">
                                        <i className="fas fa-calendar"></i>
                                        {todayTopic.date}
                                    </p>
                                    <p className="topic">
                                        <i className="fas fa-book"></i>
                                        {todayTopic.details}
                                    </p>
                                </div>
                                <div className="action-buttons">
                                    <button 
                                        className="btn-accomplish"
                                        onClick={() => handleConfirmation(true)}
                                    >
                                        <i className="fas fa-check"></i>
                                        Mark as Accomplished
                                    </button>
                                    <button 
                                        className="btn-reschedule"
                                        onClick={() => handleConfirmation(false)}
                                    >
                                        <i className="fas fa-clock"></i>
                                        Reschedule
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-topic">
                            <i className="fas fa-calendar-times"></i>
                            <p>No topic scheduled for today</p>
                        </div>
                    )}
                </section>

                <section className="timetable-card">
                    <h2>Lesson Timetable</h2>
                    {timetable.length > 0 ? (
                        <div className="table-container">
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Details</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timetable.map((entry, index) => (
                                        <tr key={index} className={entry.status?.toLowerCase().includes('rescheduled') ? 'rescheduled-row' : ''}>
                                            <td>{entry.date}</td>
                                            <td>
                                                <span className={`type-badge ${entry.type}`}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td>{entry.details}</td>
                                            <td>
                                                <span className={`status-badge ${entry.status || 'pending'}`}>
                                                    {entry.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data">
                            <i className="fas fa-calendar-minus"></i>
                            <p>No timetable available</p>
                        </div>
                    )}
                </section>
            </div>

            <nav className="dashboard-nav">
                <Link to="/syllabus" className="nav-link">
                    <i className="fas fa-book-open"></i>
                    View Syllabus
                </Link>
                <Link to="/semester" className="nav-link">
                    <i className="fas fa-calendar-alt"></i>
                    View Semester Timetable
                </Link>
            </nav>
        </div>
    );
};

export default Home;