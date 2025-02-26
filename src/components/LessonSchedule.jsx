import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LessonSchedule = () => {
    const [semesterStartDate, setSemesterStartDate] = useState('');
    const [semesterEndDate, setSemesterEndDate] = useState('');
    const [teachingDays, setTeachingDays] = useState({
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
    });
    const [holidays, setHolidays] = useState('');
    const [chapterName, setChapterName] = useState('');
    const [subtopics, setSubtopics] = useState('');
    const [semesterDetails, setSemesterDetails] = useState([]);
    const [chapterDetails, setChapterDetails] = useState([]);
    const [error, setError] = useState('');

    // Fetch saved semester and chapter details on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const semesterResponse = await axios.get('http://localhost:5000/get-semester-details');
                setSemesterDetails(semesterResponse.data);

                const chapterResponse = await axios.get('http://localhost:5000/get-chapter-details');
                setChapterDetails(chapterResponse.data);
            } catch (err) {
                setError('Failed to fetch data. Please ensure the backend is running.');
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);

    const handleTeachingDaysChange = (day) => {
        setTeachingDays({
            ...teachingDays,
            [day]: !teachingDays[day],
        });
    };

    const handleSaveSemesterDetails = async (e) => {
        e.preventDefault();
        try {
            const semesterData = {
                semesterStartDate,
                semesterEndDate,
                teachingDays,
                holidays: holidays.split(',').map((date) => date.trim()),
            };

            const response = await axios.post('http://localhost:5000/save-semester-details', semesterData);
            if (response.status === 200) {
                alert('Semester details saved successfully!');
                setSemesterDetails([...semesterDetails, semesterData]);
                // Clear form
                setSemesterStartDate('');
                setSemesterEndDate('');
                setTeachingDays({ mon: false, tue: false, wed: false, thu: false, fri: false });
                setHolidays('');
            }
        } catch (err) {
            setError('Failed to save semester details. Please check your connection and try again.');
            console.error('Error saving semester details:', err);
        }
    };

    const handleSaveChapterDetails = async (e) => {
        e.preventDefault();
        try {
            const chapterData = {
                chapterName,
                subtopics: subtopics.split(',').map((topic) => topic.trim()),
            };

            const response = await axios.post('http://localhost:5000/save-chapter-details', chapterData);
            if (response.status === 200) {
                alert('Chapter details saved successfully!');
                setChapterDetails([...chapterDetails, chapterData]);
                // Clear form
                setChapterName('');
                setSubtopics('');
            }
        } catch (err) {
            setError('Failed to save chapter details. Please check your connection and try again.');
            console.error('Error saving chapter details:', err);
        }
    };

    return (
        <div className="lesson-schedule-container">
            <h2>Lesson Schedule</h2>
            {error && <p className="error">{error}</p>}

            {/* Semester Details Form */}
            <form onSubmit={handleSaveSemesterDetails}>
                <h3>Semester Details</h3>
                <div>
                    <label>Semester Start Date:</label>
                    <input
                        type="date"
                        value={semesterStartDate}
                        onChange={(e) => setSemesterStartDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Semester End Date:</label>
                    <input
                        type="date"
                        value={semesterEndDate}
                        onChange={(e) => setSemesterEndDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Teaching Days:</label>
                    {['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => (
                        <label key={day}>
                            <input
                                type="checkbox"
                                checked={teachingDays[day]}
                                onChange={() => handleTeachingDaysChange(day)}
                            />
                            {day.toUpperCase()}
                        </label>
                    ))}
                </div>
                <div>
                    <label>Holidays (comma-separated dates):</label>
                    <input
                        type="text"
                        value={holidays}
                        onChange={(e) => setHolidays(e.target.value)}
                        placeholder="e.g., 2023-10-02, 2023-10-09"
                    />
                </div>
                <button type="submit">Save Semester Details</button>
            </form>

            {/* Chapter Details Form */}
            <form onSubmit={handleSaveChapterDetails}>
                <h3>Chapter Details</h3>
                <div>
                    <label>Chapter Name:</label>
                    <input
                        type="text"
                        value={chapterName}
                        onChange={(e) => setChapterName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Subtopics (comma-separated):</label>
                    <input
                        type="text"
                        value={subtopics}
                        onChange={(e) => setSubtopics(e.target.value)}
                        placeholder="e.g., Topic 1, Topic 2, Topic 3"
                        required
                    />
                </div>
                <button type="submit">Save Chapter Details</button>
            </form>

            {/* Display Saved Data */}
            <h3>Saved Semester Details</h3>
            {semesterDetails.length > 0 ? (
                <ul>
                    {semesterDetails.map((semester, index) => (
                        <li key={index}>
                            <p><strong>Start Date:</strong> {semester.semesterStartDate}</p>
                            <p><strong>End Date:</strong> {semester.semesterEndDate}</p>
                            <p><strong>Teaching Days:</strong> {Object.keys(semester.teachingDays).filter((day) => semester.teachingDays[day]).join(', ')}</p>
                            <p><strong>Holidays:</strong> {semester.holidays.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No semester details saved yet.</p>
            )}

            <h3>Saved Chapter Details</h3>
            {chapterDetails.length > 0 ? (
                <ul>
                    {chapterDetails.map((chapter, index) => (
                        <li key={index}>
                            <p><strong>Chapter:</strong> {chapter.chapterName}</p>
                            <p><strong>Subtopics:</strong> {chapter.subtopics.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No chapter details saved yet.</p>
            )}
        </div>
    );
};

export default LessonSchedule;