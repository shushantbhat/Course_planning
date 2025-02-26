import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LessonTimetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [todayTopic, setTodayTopic] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Fetch combined data and generate timetable
    useEffect(() => {
        const fetchDataAndGenerateTimetable = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/get-combined-details');
                console.log('Response received:', response.data); // Debug log

                // Handle case where response.data is undefined or null
                if (!response.data) {
                    throw new Error('No data received from server');
                }

                const { semester_details, chapter_details } = response.data;
                console.log('Semester details:', semester_details); // Debug log
                console.log('Chapter details:', chapter_details); // Debug log

                // More specific error messages for different cases
                if (!semester_details) {
                    throw new Error('Semester details are missing from server response');
                }
                if (!chapter_details) {
                    throw new Error('Chapter details are missing from server response');
                }
                if (!Array.isArray(semester_details)) {
                    throw new Error('Semester details must be an array');
                }
                if (!Array.isArray(chapter_details)) {
                    throw new Error('Chapter details must be an array');
                }
                if (semester_details.length === 0) {
                    throw new Error('No semester details found');
                }
                if (chapter_details.length === 0) {
                    throw new Error('No chapter details found');
                }

                const generatedTimetable = generateTimetable(
                    semester_details[semester_details.length - 1],
                    chapter_details
                );
                setTimetable(generatedTimetable);

                // Check for today's topic only if it's a class
                const today = new Date().toISOString().split('T')[0];
                const todaysEntry = generatedTimetable.find(entry => entry.date === today);
                if (todaysEntry && todaysEntry.type === 'Class') {  // Only show dialog for actual classes
                    setTodayTopic(todaysEntry);
                    setShowConfirmDialog(true);
                }

                // Save timetable
                try {
                    await axios.post('http://localhost:5000/save-timetable', 
                        { timetable: generatedTimetable },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    console.log('Timetable saved successfully as JSON');
                } catch (saveError) {
                    console.warn('Failed to save timetable:', saveError);
                }
            } catch (err) {
                const errorMessage = err.response?.status === 404 
                    ? 'Backend server is not available. Please ensure the server is running.'
                    : err.message || 'Failed to fetch data or generate timetable.';
                setError(errorMessage);
                console.error('Error details:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataAndGenerateTimetable();
    }, []);

    // Function to generate the timetable
    const generateTimetable = (semester, chapters) => {
        const { semesterStartDate, semesterEndDate, teachingDays, holidays } = semester;
        const startDate = new Date(semesterStartDate);
        const endDate = new Date(semesterEndDate);
        const holidayDates = holidays.map((date) => new Date(date).toISOString().split('T')[0]);

        const timetable = [];
        let currentDate = new Date(startDate);
        let topicIndex = 0;

        // Flatten all subtopics from all chapters
        const allSubtopics = chapters.flatMap((chapter) =>
            chapter.subtopics.map((subtopic) => ({
                chapter: chapter.chapterName,
                subtopic,
            }))
        );

        // Iterate through each date from start to end
        while (currentDate <= endDate) {
            const currentDateString = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

            // Check if the current date is a holiday
            if (holidayDates.includes(currentDateString)) {
                timetable.push({
                    date: currentDateString,
                    type: 'Holiday',
                    details: 'No classes',
                });
            }
            // Check if the current date is a teaching day
            else if (teachingDays[dayOfWeek]) {
                if (topicIndex < allSubtopics.length) {
                    // Schedule a subtopic
                    timetable.push({
                        date: currentDateString,
                        type: 'Class',
                        details: `${allSubtopics[topicIndex].chapter}: ${allSubtopics[topicIndex].subtopic}`,
                    });
                    topicIndex++;
                } else {
                    // No more subtopics to schedule
                    timetable.push({
                        date: currentDateString,
                        type: 'Vacant',
                        details: 'No topics scheduled',
                    });
                }
            } else {
                // Not a teaching day
                timetable.push({
                    date: currentDateString,
                    type: 'Non-teaching day',
                    details: 'No classes',
                });
            }

            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return timetable;
    };

    const handleTopicCompletion = async (isCompleted) => {
        if (!isCompleted && todayTopic && todayTopic.type === 'Class') {
            try {
                // Find available slots in the current timetable
                const today = new Date(todayTopic.date);
                const availableSlots = timetable.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate > today && 
                           (entry.type === 'Vacant' || entry.type === 'Non-teaching day');
                });

                const response = await axios.post('http://localhost:5000/reschedule-topic', 
                    {
                        topic: todayTopic,
                        currentDate: todayTopic.date,
                        availableSlots: availableSlots.map(slot => ({
                            date: slot.date,
                            type: slot.type
                        }))
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        timeout: 5000
                    }
                );

                if (response.data.updatedTimetable) {
                    setTimetable(response.data.updatedTimetable);
                    alert('Topic rescheduled successfully!');
                } else {
                    throw new Error('Failed to get updated timetable from server');
                }
            } catch (err) {
                let errorMessage = 'Failed to reschedule topic: ';
                if (err.code === 'ERR_NETWORK') {
                    errorMessage += 'Cannot connect to server. Please ensure the backend is running.';
                } else if (err.response?.status === 403) {
                    errorMessage += 'CORS error - Backend server needs to enable cross-origin requests.';
                } else {
                    errorMessage += err.message || 'Unknown error occurred';
                }
                setError(errorMessage);
                console.error('Rescheduling error:', err);
            }
        } else if (isCompleted && todayTopic && todayTopic.type === 'Class') {
            try {
                // Find the next teaching day
                const today = new Date(todayTopic.date);
                const nextTeachingDay = timetable.find(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate > today && entry.type === 'Class';
                });

                if (!nextTeachingDay) {
                    throw new Error('No future teaching days available');
                }

                const response = await axios.post('http://localhost:5000/append-to-next-day',
                    {
                        completedTopic: todayTopic,
                        nextTeachingDate: nextTeachingDay.date
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        timeout: 5000
                    }
                );

                if (response.data.updatedTimetable) {
                    setTimetable(response.data.updatedTimetable);
                    alert('Topic completed and next day updated successfully!');
                } else {
                    throw new Error('Failed to update next teaching day');
                }
            } catch (err) {
                let errorMessage = 'Failed to update next teaching day: ';
                if (err.code === 'ERR_NETWORK') {
                    errorMessage += 'Cannot connect to server. Please ensure the backend is running.';
                } else {
                    errorMessage += err.message || 'Unknown error occurred';
                }
                setError(errorMessage);
                console.error('Update error:', err);
            }
        }
        setShowConfirmDialog(false);
    };

    return (
        <div className="lesson-timetable-container">
            <h2>Lesson Timetable</h2>
            
            {isLoading && (
                <div className="loading-message">
                    <p>Loading timetable...</p>
                </div>
            )}
            
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {showConfirmDialog && todayTopic && (
                <div className="topic-confirmation">
                    <h3>Today's Topic</h3>
                    <p><strong>Topic:</strong> {todayTopic.details}</p>
                    <p>Was this topic covered today?</p>
                    <div className="confirmation-buttons">
                        <button onClick={() => handleTopicCompletion(true)}>
                            Yes, completed
                        </button>
                        <button onClick={() => handleTopicCompletion(false)}>
                            No, needs rescheduling
                        </button>
                    </div>
                </div>
            )}

            {!isLoading && !error && timetable.length > 0 ? (
                <div className="table-container">
                    <table className="timetable">
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
                                <tr key={index}>
                                    <td>{entry.date}</td>
                                    <td>{entry.type}</td>
                                    <td>{entry.details}</td>
                                    <td>
                                        <span className={`status-badge ${
                                            !entry.status ? 'status-pending' :
                                            entry.status === 'Completed' ? 'status-completed' :
                                            'status-rescheduled'
                                        }`}>
                                            {entry.status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : !isLoading && !error ? (
                <p className="no-timetable">No timetable generated yet.</p>
            ) : null}
        </div>
    );
};

export default LessonTimetable;