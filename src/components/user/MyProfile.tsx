import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosConfig';
import {User} from "../../types";
import MyNews from "../news/MyNews";

const MyProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                </div>
            </div>
            <div className="news-section">
                <MyNews />
            </div>
        </div>
    );
};

export default MyProfile;
