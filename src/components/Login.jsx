import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [subject, setSubject] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });
            if (response.data.message === "Login successful") {
                navigate('/home');
            }
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/register', {
                username,
                password,
                subject
            });
            if (response.status === 201) {
                alert('Registration successful! Please login.');
                setIsRegistering(false);
            }
        } catch (err) {
            setError('Registration failed. Username may already exist.');
        }
    };

    return (
        <div className="login-container">
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {isRegistering && (
                    <div>
                        <label>Subject:</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>
                )}
                <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
            </form>
            <p>
                {isRegistering ? (
                    <span>
                        Already have an account?{' '}
                        <button onClick={() => setIsRegistering(false)}>Login here</button>
                    </span>
                ) : (
                    <span>
                        Don't have an account?{' '}
                        <button onClick={() => setIsRegistering(true)}>Register here</button>
                    </span>
                )}
            </p>
        </div>
    );
};

export default Login;