import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Semester = () => {
    const [semester, setSemester] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSemester = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get-semester');
                setSemester(response.data);
            } catch (err) {
                setError('Failed to fetch semester timetable');
            }
        };
        fetchSemester();
    }, []);

    return (
        <div className="semester-container">
            <h1>Semester Timetable</h1>
            {error && <p className="error">{error}</p>}
            {semester ? (
                <pre>{JSON.stringify(semester, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Semester;
