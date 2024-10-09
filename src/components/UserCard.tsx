import React from "react";
import { User } from "../types";
import { useNavigate } from "react-router-dom";

interface UserCardProps {
    user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
    const { username, firstName, lastName, fsUserId } = user;
    const navigate = useNavigate();

    const staticPhotoUrl = '/user-photo.jpg';

    const handleClick = () => {
        navigate(`/user/${fsUserId}`);
    };

    return (
        <div className="user-card-container">
            <img src={staticPhotoUrl} alt="User Photo" className="user-mini-photo" onClick={handleClick}/>
            <div className="user-mini-info">
                <h2>{username}</h2>
                <p>{firstName} {lastName}</p>
            </div>
        </div>
    );
};

export default UserCard;
