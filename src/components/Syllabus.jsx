import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Syllabus = () => {
    const [syllabus, setSyllabus] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get-syllabus');
                setSyllabus(response.data);
            } catch (err) {
                setError('Failed to fetch syllabus');
            }
        };
        fetchSyllabus();
    }, []);

    return (
        <div className="syllabus-container">
            <h1>Syllabus</h1>
            {error && <p className="error">{error}</p>}
            {syllabus ? (
                <pre>{JSON.stringify(syllabus, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Syllabus;
