import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../configuration/axiosConfig";
import { AxiosError } from "axios";

export default function ResetPassword() {
    const [email, setEmail] = useState<string>('');
    const [resetCode, setResetCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [codeError, setCodeError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const navigate = useNavigate();

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await axiosInstance
                .post('/auth/reset-password-request', {email})
                .then(() => {
                    setEmailSent(true);
                    setMessage('A reset code has been sent to your email. The code is valid for 1 minute.');
                    setTimeout(() => setMessage(''), 5000);
                });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                switch (error.response.data.code) {
                    case "SERVICE-1001":
                        setErrorMessage('User with this email address was not found.');
                        break;
                    default:
                        setErrorMessage(error.response.data.message || 'Failed to send reset password. Please try again.');
                }
                setTimeout(() => setErrorMessage(''), 5000);
            }
        }
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 4) {
            setPasswordError("Password must be at least 5 characters long.");
            return;
        } else {
            setPasswordError("");
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match. Please try again.");
            return;
        } else {
            setConfirmPasswordError("");
        }

        try {
            await axiosInstance
                .post('/auth/reset-password', {
                    email: email,
                    code: resetCode,
                    newPassword: newPassword
                })
                .then(() => navigate('/login',
                    { state: { message: 'Successfully reset the password. Please log in.' } }
                ));
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                switch (error.response.data.code) {
                    case "SERVICE-0012":
                        setCodeError(error.response.data.message);
                        break;
                    default:
                        setErrorMessage(error.response.data.message || 'Failed to send reset email. Please try again.');
                }
                setTimeout(() => setErrorMessage(''), 5000);
            }
        }
    };

    return (
        <div className="form-wrapper">
            <h1>Reset Password</h1>
            {message && <div className="alert alert-success" role="alert">{message}</div>}
            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

            {!emailSent ? (
                <form onSubmit={handleEmailSubmit}>
                    <label>
                        <p>Email</p>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <div className="button-container">
                        <button onClick={() => navigate("/login")} className='return-button'>Return</button>
                        <button type="submit" className="green-button">Send reset code</button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <label>
                        <p>Reset Code</p>
                        <input
                            type="text"
                            required
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            style={{
                                border: codeError ? '2px solid red' : '1px solid #ccc'
                            }}
                        />
                        {codeError && <div className="alert alert-danger">{codeError}</div>}
                    </label>
                    <label>
                        <p>New Password</p>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                                border: passwordError ? '2px solid red' : '1px solid #ccc'
                            }}
                        />
                        {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                    </label>
                    <label>
                        <p>Confirm New Password</p>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                border: confirmPasswordError ? '2px solid red' : '1px solid #ccc'
                            }}
                        />
                        {confirmPasswordError && <div className="alert alert-danger">{confirmPasswordError}</div>}
                    </label>
                    <div className="button-container">
                        <button onClick={() => navigate("/login")} className='return-button'>Return</button>
                        <button type="submit" className="green-button">Reset Password</button>
                    </div>
                </form>
            )}
        </div>
    );
}
