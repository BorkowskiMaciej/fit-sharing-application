import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {User} from "../types";

const UserProfile: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/users/${uuid}`);
                setUser(response.data);
                setError(null);
            } catch (err) {
                setError('User not found or error occurred');
                setUser(null);
            }
        };

        if (uuid) {
            fetchUser();
        }
    }, [uuid]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    const staticPhotoUrl = '/user-photo.jpg';

    return (
        <div className="user-search-container">
            <div className="user-profile-container">
                <div className="user-info">
                    <img src={staticPhotoUrl} alt="User Photo" className="user-photo" />
                    <h2 style={{ textTransform: 'lowercase' }}>{user.username}</h2>
                    <h3 style={{ textAlign: 'center' }}>{`${user.firstName} ${user.lastName}`}</h3>
                    <p>Wiek: {user.age}</p>
                    <p>Opis: {user.description}</p>
                </div>
            </div>
        </div>

    );
};

export default UserProfile;
