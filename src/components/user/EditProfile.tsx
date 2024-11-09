import React, {useState, useEffect, useRef} from 'react';
import axiosInstance from '../../configuration/axiosConfig';
import {useNavigate} from 'react-router-dom';
import {User, UserToken} from "../../types";
import moment from "moment";
import AvatarEditor from "react-avatar-editor";
import {useAvatarUploader} from "../../hooks/useAvatarUploader";

const EditProfile: React.FC<{ setTokenData: (token: UserToken | null) => void }> = ({ setTokenData }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [scale, setScale] = useState(1);
    const editorRef = useRef<AvatarEditor | null>(null);
    const { selectedImage, setSelectedImage, getAvatarAsBase64, getRootProps, getInputProps } = useAvatarUploader();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                await axiosInstance
                    .get(`/users/me`)
                    .then(response => {
                        setUser(response.data);
                        setSelectedImage(response.data.profilePicture)
                    });
            } catch (error) {
                console.log('Failed to fetch user data', error);
            }
        };

        loadData();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user?.firstName.trim() || user?.firstName.length > 15) {
            setFirstNameError("First name must be between 1 and 15 characters long and cannot be only whitespace.");
            return;
        } else {
            setFirstNameError("");
        }

        if (!user?.lastName.trim() || user?.lastName.length > 15) {
            setLastNameError("Last name must be between 1 and 15 characters long and cannot be only whitespace.");
            return;
        } else {
            setLastNameError("");
        }

        if (user?.description.length > 200) {
            setDescriptionError("Description cannot exceed 200 characters.");
            return;
        } else {
            setDescriptionError("");
        }

        try {
            const profilePictureBase64 = editorRef.current ? await getAvatarAsBase64(editorRef.current) : null;
            await axiosInstance
                .put(`/users`, {
                    ...user,
                    profilePicture: profilePictureBase64
                })
                .then(() => {
                    window.dispatchEvent(new CustomEvent('showMessage',
                        {detail: {message: 'Profile updated successfully.', type: 'green'}}));
                    navigate('/me');
                });
        } catch (error: any) {
            console.error('Error updating user profile:', error.message);
            throw error;
        }

    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setUser(prev => prev ? {...prev, [name]: value} : null);
    };

    const handleUserDelete = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                await axiosInstance
                    .delete(`/users`)
                    .then(() => {
                        window.dispatchEvent(new CustomEvent('showMessage', {
                            detail: {message: 'Account deleted successfully.', type: 'green'}
                        }));
                        setTokenData(null);
                        navigate('/login');
                    });
            } catch (error) {
                window.dispatchEvent(new CustomEvent('showMessage', {
                    detail: {message: 'Failed to delete account.', type: 'red'}
                }));
            }
        }
    };

    return (
        <div className="form-wrapper">
            <h1>Edit Profile</h1>
            {user && (
                <form onSubmit={handleSubmit}>
                    <label>
                        <p>Username</p>
                        <input
                            type="text"
                            value={user.username}
                            disabled
                        />
                    </label>
                    <label>
                        <p>Email</p>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                        />
                    </label>
                    <label>
                        <p>Date of Birth</p>
                        <input
                            type="text"
                            value={moment(user.dateOfBirth).format('DD-MM-YYYY')}
                            disabled
                        />
                    </label>
                    <label>
                        <p>First Name</p>
                        <input type="text" name="firstName" value={user.firstName} onChange={handleChange} required
                               style={{
                                   border: firstNameError ? '2px solid red' : '1px solid #ccc'
                               }}/>
                        {firstNameError && <div className="alert alert-danger">{firstNameError}</div>}
                    </label>
                    <label>
                        <p>Last Name</p>
                        <input type="text" name="lastName" value={user.lastName} onChange={handleChange} required
                               style={{
                                   border: lastNameError ? '2px solid red' : '1px solid #ccc'
                               }}/>
                        {lastNameError && <div className="alert alert-danger">{lastNameError}</div>}
                    </label>
                    <label>
                        <p>Gender</p>
                        <div className="gender-container">
                            {['Male', 'Female', 'Other'].map((option) => (
                                <label key={option}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={option.toUpperCase()}
                                        checked={user.gender === option.toUpperCase()}
                                        onChange={handleChange}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </label>
                    <label>
                        <p>Profile Picture</p>
                        <div
                            {...getRootProps()}
                            style={{
                                border: '2px dashed #ccc',
                                padding: '20px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <input {...getInputProps()} />
                            {!selectedImage && <p>Drag and drop an image here, or click to select one.</p>}
                            {selectedImage && <p>Click to select a different image or drag another one.</p>}
                        </div>
                    </label>
                    <label>
                        {selectedImage && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <AvatarEditor
                                    ref={editorRef}
                                    image={selectedImage}
                                    width={300}
                                    height={300}
                                    border={5}
                                    borderRadius={150}
                                    scale={scale}
                                />
                            </div>
                        )}
                        {selectedImage && (
                            <div style={{ textAlign: 'center', marginTop: '10px'}}>
                                <input
                                    style={{marginRight: '10px'}}
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.01"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                />
                                <button type="button" className="delete-photo-button" onClick={() => {
                                    setSelectedImage(null);
                                }}>Remove Image</button>
                            </div>
                        )}
                    </label>
                    <label>
                        <p>Description</p>
                        <textarea name="description" value={user.description} onChange={handleChange} style={{
                            border: descriptionError ? '2px solid red' : '1px solid #ccc'
                        }}/>
                        {descriptionError && <div className="alert alert-danger">{descriptionError}</div>}
                    </label>
                    <div className="button-container">
                        <button onClick={() => navigate("/me")} className='return-button'>Return</button>
                        <button type="submit" className='green-button'>Update profile</button>
                    </div>
                    <button type="button" onClick={handleUserDelete} className='red-button'>Delete account</button>
                </form>
            )}
        </div>
    );
}

export default EditProfile;