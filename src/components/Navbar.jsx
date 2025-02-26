import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    // Hide Navbar on the login/register page
    if (location.pathname === '/' || location.pathname === '/login') {
        return null;
    }

    return (
        <nav className="navbar">
            <Link to="/home">Home</Link>
            <Link to="/lesson-schedule">Lesson Schedule</Link>
            <Link to="/lesson-timetable">Lesson Timetable</Link>
        </nav>
    );
};

export default Navbar;