import React, { useState } from 'react';
import PropTypes from 'prop-types';

import axiosInstance from '../axiosConfig';

type LoginCredentials = {
    username: string;
    password: string;
};

async function loginUser(credentials: LoginCredentials) {
    try {
        const response = await axiosInstance.post('/auth/login', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Error during login:', error.message);
        throw error;
    }
}

type LoginProps = {
    setToken: (data: { token: string; expiresIn: number }) => void;
};

export default function Login({ setToken }: LoginProps) {
    const [username, setUserName] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const { token, expiresIn } = await loginUser({
                username: username || '',
                password: password || '',
            });
            setToken({ token, expiresIn });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="login-wrapper">
            <h1>Please Log In</h1>
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
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};
