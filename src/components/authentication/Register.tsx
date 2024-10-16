import React, {useState} from 'react';
import axiosInstance from '../../axiosConfig';
import {Link, useNavigate} from 'react-router-dom';
import {AxiosError} from "axios";

type RegisterCredentials = {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    description: string;
};

async function registerUser(credentials: RegisterCredentials) {
    try {
        return await axiosInstance.post('/auth/register', credentials);
    } catch (error: any) {
        console.error('Error during registration:', error.message);
        throw error;
    }
}

export default function Register() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState<number | undefined>();
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username.trim() || username.length > 15) {
            setUsernameError("Username must be between 1 and 15 characters long and cannot be only whitespace.");
            return;
        } else {
            setUsernameError("");
        }

        if (!password || password.length < 4) {
            setPasswordError("Password must be at least 5 characters long.");
            return;
        } else {
            setPasswordError("");
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match. Please try again.");
            return;
        } else {
            setConfirmPasswordError("");
        }

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        } else {
            setEmailError("");
        }

        if (!firstName.trim() || firstName.length > 15) {
            setFirstNameError("First name must be between 1 and 15 characters long and cannot be only whitespace.");
            return;
        } else {
            setFirstNameError("");
        }

        if (!lastName.trim() || lastName.length > 15) {
            setLastNameError("Last name must be between 1 and 15 characters long and cannot be only whitespace.");
            return;
        } else {
            setLastNameError("");
        }

        if (description.length > 200) {
            setDescriptionError("Description cannot exceed 200 characters.");
            return;
        } else {
            setDescriptionError("");
        }

        try {
            const response = await registerUser({
                username: username || '',
                password: password || '',
                email: email || '',
                firstName: firstName || '',
                lastName: lastName || '',
                age: age || 0,
                description: description || '',
            });
            if (response.status === 201) {
                navigate('/login', { state: { message: 'Successfully registered. Please log in.' } });
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            if (error instanceof AxiosError) {
                if (error.response && error.response.data) {
                    switch (error.response.data.code) {
                        case "SERVICE-0002":
                            setUsernameError(error.response.data.message)
                            break;
                        case "SERVICE-0003":
                            setEmailError(error.response.data.message)
                            break;
                        default:
                            setMessage(error.response.data.message || 'Registration failed. Please try again.');
                    }
                }
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
                <h1>Register form</h1>
                {message && <div className="alert alert-danger">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <label>
                        <p>Username</p>
                        <input
                            type="text"
                            required
                            onChange={e => setUserName(e.target.value)}
                            style={{
                                border: usernameError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {usernameError && <div className="alert alert-danger">{usernameError}</div>}
                    </label>
                    <label>
                        <p>Password</p>
                        <input
                            type="password"
                            required
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                border: passwordError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                    </label>
                    <label>
                        <p>Confirm password</p>
                        <input
                            type="password"
                            required
                            onChange={e => setConfirmPassword(e.target.value)}
                            style={{
                                border: confirmPasswordError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {confirmPasswordError && <div className="alert alert-danger">{confirmPasswordError}</div>}
                    </label>
                    <label>
                        <p>Email</p>
                        <input
                            type="text"
                            required
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                border: emailError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {emailError && <div className="alert alert-danger">{emailError}</div>}
                    </label>
                    <label>
                        <p>First Name</p>
                        <input
                            type="text"
                            required
                            onChange={e => setFirstName(e.target.value)}
                            style={{
                                border: firstNameError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {firstNameError && <div className="alert alert-danger">{firstNameError}</div>}
                    </label>
                    <label>
                        <p>Last Name</p>
                        <input
                            type="text"
                            required
                            onChange={e => setLastName(e.target.value)}
                            style={{
                                border: lastNameError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {lastNameError && <div className="alert alert-danger">{lastNameError}</div>}
                    </label>
                    <label>
                        <p>Age</p>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            onChange={e => setAge(parseInt(e.target.value, 10))}/>
                    </label>
                    <label>
                        <p>Description</p>
                        <textarea
                            onChange={e => setDescription(e.target.value)}
                            style={{
                                border: descriptionError ? '2px solid red' : '1px solid #ccc'
                            }}/>
                        {descriptionError && <div className="alert alert-danger">{descriptionError}</div>}
                    </label>
                    <div>
                        <button type="submit">Register</button>
                    </div>
                </form>
                <div>
                    <Link to="/login">Already have an account?</Link>
                </div>
            </div>
        </>
    );
}