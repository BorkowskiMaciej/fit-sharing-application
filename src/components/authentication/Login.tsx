import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import axiosInstance from '../../configuration/axiosConfig';
import {Link, useLocation, useNavigate} from "react-router-dom";
import {AxiosError} from "axios";

type LoginCredentials = {
    username: string;
    password: string;
};

async function loginUser(credentials: LoginCredentials) {
    try {
        return await axiosInstance.post('/auth/login', credentials);
    } catch (error: any) {
        console.error('Error during login:', error.message);
        throw error;
    }
}

type LoginProps = {
    setToken: (data: { fsUserId: string, token: string; expiresIn: number }) => void;
};

export default function Login({ setToken }: LoginProps) {
    const [username, setUserName] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [message, setMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();

    const location = useLocation();
    const locationMessage = location.state?.message;

    useEffect(() => {
        if (locationMessage) {
            setMessage(locationMessage);
            setTimeout(() => setMessage(''), 5000);
        }
    }, [locationMessage]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await loginUser({
                username: username || '',
                password: password || '',
            });
            if (response.status === 200) {
                setToken({ fsUserId: response.data.fsUserId, token: response.data.token, expiresIn: response.data.expiresIn });
                navigate('/');
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            console.error('Login failed:', error);
            if (error instanceof AxiosError) {
                setErrorMessage('Invalid credentials. Please try again.');
            }
        }
    };

    return (
        <>
            <div className="navbar">
                <div className="navbar-section">
                    <h2 className="navbar-title">Fit Sharing</h2>
                </div>
            </div>
            <div className="form-wrapper">
                <h1>Login form</h1>
                {message && <div className="alert alert-success" role="alert">{message}</div>}
                {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <label>
                        <p>Username</p>
                        <input
                            type="text"
                            onChange={e => setUserName(e.target.value)}
                        />
                    </label>
                    <label>
                        <p>Password</p>
                        <input
                            type="password"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </label>
                    <button type="submit" className='accept-button' style={{ alignSelf: 'flex-end', width: '150px'}}>Log in</button>
                </form>
                <div>
                    <Link to="/register">Need an account?</Link>
                    <Link to="/reset-password">Forgot your password?</Link>
                </div>
            </div>
        </>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};
