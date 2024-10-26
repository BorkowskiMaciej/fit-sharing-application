import React from 'react';
import moment from 'moment';
import { User } from '../../types';

interface UserProfileInfoProps {
    user: User;
    onEditProfile?: () => void;
    onChangePassword?: () => void;
    actions?: React.ReactNode;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user, actions }) => {
    const defaultPhoto = '/user-photo.jpg';

    return (
        <div className="user-profile-container">
            <div className="user-info">
                <img src={user.profilePicture ? user.profilePicture : defaultPhoto} alt="" className="user-photo" />
                <h2 style={{ textTransform: 'lowercase' }}>{user.username}</h2>
                <h3 style={{ textAlign: 'center' }}>{`${user.firstName} ${user.lastName}`}</h3>
                <p>Age: {moment().diff(moment(user.dateOfBirth), 'years')}</p>
                <p>Gender: {user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()}</p>
                <p>Description: {user.description}</p>
                <div className="actions-container">
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default UserProfileInfo;
