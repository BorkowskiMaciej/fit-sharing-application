import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../configuration/axiosConfig';
import {User} from "../../types";
import FriendsNewsList from "../news/FriendsNewsList";
import moment from "moment/moment";

const FriendProfile: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/users/${uuid}`);
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

        <div className="user-container">
            <div className="user-profile-container">
                <div className="user-info">
                    <img src={staticPhotoUrl} alt="User Photo" className="user-photo" />
                    <h2 style={{ textTransform: 'lowercase' }}>{user.username}</h2>
                    <h3 style={{ textAlign: 'center' }}>{`${user.firstName} ${user.lastName}`}</h3>
                    <p>Age: {moment().diff(moment(user.dateOfBirth), 'years')}</p>
                    <p>Gender: {user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()}</p>
                    <p>Description: {user.description}</p>
                </div>
            </div>
            <div className="news-section">
                <FriendsNewsList friendFsUserId={user.fsUserId} />
            </div>
        </div>
    );
};

export default FriendProfile;
