import React from 'react';
import moment from 'moment';
import { User } from '../../types';
import { DEFAULT_USER_PHOTO } from "../../constants";

interface UserProfileInfoProps {
    user: User;
    actions?: React.ReactNode;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user, actions }) => {
    return (
        <div className="user-profile-container">
            <div className="user-info">
                <img src={user.profilePicture ? user.profilePicture : DEFAULT_USER_PHOTO} alt="" className="user-photo" />
                <div className="user-name-container">
                    <h2 className="user-username">{user.username}</h2>
                    <h3 className="user-full-name">{`${user.firstName} ${user.lastName}`}</h3>
                </div>
                <div className="user-details">
                    <p><strong>Age:</strong> {moment().diff(moment(user.dateOfBirth), 'years')}</p>
                    <p><strong>Gender:</strong> {user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()}</p>
                    <p><strong>Description:</strong> {user.description}</p>
                </div>
                <div className="actions-container">
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default UserProfileInfo;
