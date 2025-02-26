import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Syllabus from './components/Syllabus';
import Semester from './components/Semester';
import LessonSchedule from './components/LessonSchedule';
import Navbar from './components/Navbar';
import './App.css';
import LessonTimetable from './components/LessonTimetable';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/syllabus" element={<Syllabus />} />
                <Route path="/semester" element={<Semester />} />
                <Route path="/lesson-schedule" element={<LessonSchedule />} />
                <Route path="/lesson-timetable" element={<LessonTimetable />} />
            </Routes>
        </Router>
    );
};

export default App;