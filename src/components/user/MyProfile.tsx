import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosConfig';
import {User} from "../../types";
import MyNewsComponent from "../news/MyNewsComponent";
import {useNavigate} from "react-router-dom";

const MyProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/users/me`);
                setUser(response.data);
                setError(null);
            } catch (err) {
                setError('User not found or error occurred');
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    const staticPhotoUrl = '/user-photo.jpg';

    return (

        <div className="user-container">
            <div className="user-profile-container">
                <div className="user-info">
                    <img src={staticPhotoUrl} alt="User Photo" className="user-photo" />
                    <h2 style={{ textTransform: 'lowercase' }}>{user.username}</h2>
                    <h3 style={{ textAlign: 'center' }}>{`${user.firstName} ${user.lastName}`}</h3>
                    <p>Wiek: {user.age}</p>
                    <p>Opis: {user.description}</p>
                    <div className="icon-container edit-profile-icon" onClick={() => navigate("/me/edit")}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon edit-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z"/>
                        </svg>
                        <span>Edit profile</span>
                    </div>
                </div>
            </div>
            <div className="news-section">
                <MyNewsComponent />
            </div>
        </div>
    );
};

export default MyProfile;
