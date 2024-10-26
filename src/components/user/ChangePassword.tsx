import React, { useState } from 'react';
import axiosInstance from '../../configuration/axiosConfig';
import { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';

type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
};

async function changePassword(credentials: ChangePasswordRequest) {
    try {
        return await axiosInstance.patch('/users/password', credentials);
    } catch (error: any) {
        console.error('Error changing password:', error.message);
        throw error;
    }
}

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState<string | undefined>();
    const [newPassword, setNewPassword] = useState<string | undefined>();
    const [confirmNewPassword, setConfirmNewPassword] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [currentPasswordError, setCurrentPasswordError] = useState<string>('');
    const [newPasswordError, setNewPasswordError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 4) {
            setNewPasswordError('New password must be at least 4 characters long.');
            return;
        } else {
            setNewPasswordError('');
        }

        if (newPassword !== confirmNewPassword) {
            setConfirmPasswordError('Passwords do not match. Please try again.');
            return;
        } else {
            setConfirmPasswordError('');
        }

        try {
            const response = await changePassword({
                currentPassword: currentPassword || '',
                newPassword: newPassword || '',
            });

            if (response.status === 200) {
                window.dispatchEvent(new CustomEvent('showMessage',
                    {detail: {message: 'Password changed successfully.', type: 'green'}}));
                navigate('/me');
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            console.error('Change password failed:', error);
            if (error instanceof AxiosError) {
                if (error.response && error.response.data) {
                    switch (error.response.data.code) {
                        case "SERVICE-1004":
                            setCurrentPasswordError(error.response.data.message);
                            break;
                        default:
                            setErrorMessage(error.response.data.message || 'Failed to change password. Please try again.');
                    }
                    setTimeout(() => setErrorMessage(''), 5000);
                }
            }
        }
    };

    return (
        <div className="form-wrapper">
            <h1>Change Password</h1>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Current Password</p>
                    <input
                        type="password"
                        onChange={e => setCurrentPassword(e.target.value)}
                        style={{
                            border: currentPasswordError ? '2px solid red' : '1px solid #ccc'
                        }}
                        required
                    />
                    {currentPasswordError && <div className="alert alert-danger">{currentPasswordError}</div>}
                </label>
                <label>
                    <p>New Password</p>
                    <input
                        type="password"
                        onChange={e => setNewPassword(e.target.value)}
                        style={{
                            border: newPasswordError ? '2px solid red' : '1px solid #ccc'
                        }}
                        required
                    />
                    {newPasswordError && <div className="alert alert-danger">{newPasswordError}</div>}
                </label>
                <label>
                    <p>Confirm New Password</p>
                    <input
                        type="password"
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        style={{
                            border: confirmPasswordError ? '2px solid red' : '1px solid #ccc'
                        }}
                        required
                    />
                    {confirmPasswordError && <div className="alert alert-danger">{confirmPasswordError}</div>}
                </label>
                <div className="button-container">
                    <button onClick={() => navigate("/me")} className='return-button'>Return</button>
                    <button type="submit" className="green-button">Change password</button>
                </div>
            </form>
        </div>
    );
}
