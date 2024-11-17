import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../configuration/axiosConfig';
import {Link, useLocation, useNavigate} from "react-router-dom";
import {AxiosError} from "axios";
import {generateDeviceId, getDeviceId, saveDeviceId} from "../../utils/loginUtils";
import {exportPublicKey, generateKeyPair, savePrivateKey} from "../../utils/cryptoUtils";
import {useAuth} from "../../provider/authProvider";

export default function Login() {
    const [username, setUserName] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [message, setMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();
    const { setTokenData } = useAuth();
    const location = useLocation();
    const locationMessage = location.state?.message;

    const handleLoginError = (error: unknown) => {
        let message = 'An unexpected error occurred. Please try again later.';
        if (error instanceof AxiosError && error.response?.data) {
            switch (error.response.data.code) {
                case "SERVICE-0009":
                    message = 'Invalid credentials. Please try again.';
                    break;
            }
        }
        setErrorMessage(message);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axiosInstance.post('/auth/login',{
                username: username,
                password: password,
            });
            if (response.status === 200) {
                setTokenData({
                    fsUserId: response.data.fsUserId,
                    token: response.data.token,
                    expiresIn: response.data.expiresIn
                });
                let deviceId = await getDeviceId(response.data.fsUserId);
                if (!deviceId) {
                    deviceId = generateDeviceId();
                    const keyPair = await generateKeyPair();
                    const publicKey = await exportPublicKey(keyPair.publicKey);
                    await axiosInstance
                        .post('/keys', {
                            publicKey: publicKey,
                            deviceId: deviceId
                        })
                        .then(() => {
                            savePrivateKey(keyPair.privateKey, response.data.fsUserId);
                            saveDeviceId(deviceId, response.data.fsUserId);
                        });

                }
                sessionStorage.setItem('deviceId', deviceId);
                navigate('/');
            }
        } catch (error) {
            handleLoginError(error);
        }
    };

    useEffect(() => {
        if (locationMessage) {
            setMessage(locationMessage);
            setTimeout(() => setMessage(''), 5000);
        }
    }, [locationMessage]);

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
                    <button type="submit" className='green-button'>Log in</button>
                </form>
                <Link to="/reset-password" className="forgot-password-link">Forgot your password?</Link>
                <hr style={{ margin: "20px 0", border: "0.5px solid #dddfe2" }} />
                <button onClick={() => navigate('/register')} className="return-button" style={{ display: 'block', width: '200px', margin: '0 auto'}}>Create new account</button>
            </div>
        </>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};
