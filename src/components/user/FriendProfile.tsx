import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../configuration/axiosConfig';
import {User} from "../../types";
import FriendsNewsList from "../news/FriendsNewsList";
import moment from "moment/moment";
import useToken from "../../hooks/useToken";

const FriendProfile: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [relationshipStatus, setRelationshipStatus] = useState('');
    const [senderFsUserId, setSenderFsUserId] = useState('');
    const [relationshipId, setRelationshipId] = useState('');
    const [showActions, setShowActions] = useState(false);
    const { tokenData } = useToken();
    const authorizedFsUserId = tokenData?.fsUserId;

    const fetchRelationship = async (fsUserId: string | undefined) => {
        try {
            const response = await axiosInstance.get(`/relationships/${fsUserId}`);
            setRelationshipStatus(response.data.status);
            setSenderFsUserId(response.data.sender);
            setRelationshipId(response.data.id);
        } catch (error) {
            console.error('Failed to fetch relationship status:', error);
            setRelationshipStatus("NOT_FOUND");
        }
    };
    const handleInvite = async () => {
        try {
            await axiosInstance.post(`/relationships/send/${uuid}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was sent', type: 'green' } }));
            fetchRelationship(uuid);
        } catch (error) {
            console.error('Failed to send invitation:', error);
        }
    };

    const handleDeleteInvitation = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was deleted', type: 'green' } }));
            fetchRelationship(uuid);
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };

    const handleDeleteRelationship = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Relationship was deleted', type: 'green' } }));
            fetchRelationship(uuid);
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };


    const handleAcceptInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/accept/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was accepted', type: 'green' } }));
            fetchRelationship(uuid);
        } catch (error) {
        }
    };

    const handleRejectInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/reject/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was rejected', type: 'green' } }));
            fetchRelationship(uuid);
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };

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
            fetchRelationship(uuid);
        }
    }, [uuid]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    const defaultPhoto = '/user-photo.jpg';

    return (
        <div className="user-container">
            <div className="user-profile-container">
                <div className="user-info">
                    <img src={user.profilePicture ? user.profilePicture : defaultPhoto} alt="" className="user-photo" />
                    <h2 style={{ textTransform: 'lowercase' }}>{user.username}</h2>
                    <h3 style={{ textAlign: 'center' }}>{`${user.firstName} ${user.lastName}`}</h3>
                    <p>Age: {moment().diff(moment(user.dateOfBirth), 'years')}</p>
                    <p>Gender: {user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()}</p>
                    <p>Description: {user.description}</p>
                    <div className='user-button-container'>
                        {relationshipStatus === 'ACCEPTED' && (
                            <div className="remove-user-container">
                                <div className="action-icon-container" onClick={() => setShowActions(!showActions)}>
                                    <svg className="action-icon" viewBox="0 0 24 6" fill="currentColor">
                                        <circle cx="3" cy="3" r="2.5" />
                                        <circle cx="12" cy="3" r="2.5" />
                                        <circle cx="21" cy="3" r="2.5" />
                                    </svg>
                                </div>
                                {showActions && (
                                    <ul className="actions-list">
                                        <li onClick={handleDeleteRelationship}>Remove from friends</li>
                                    </ul>
                                )}
                            </div>
                        )}
                        {relationshipStatus === 'PENDING' && authorizedFsUserId === senderFsUserId && (
                            <button className="relationship-button reject-button" onClick={handleDeleteInvitation}>Delete invitation</button>
                        )}
                        {relationshipStatus === 'PENDING' && !(authorizedFsUserId === senderFsUserId) && (
                            <div className="buttons-container">
                                <button className="relationship-button accept-button" onClick={handleAcceptInvitation}>
                                    Accept invitation
                                </button>
                                <button className="relationship-button reject-button" onClick={handleRejectInvitation}>
                                    Reject invitation
                                </button>
                            </div>
                        )}
                        {(relationshipStatus === 'NOT_FOUND' || relationshipStatus === 'REJECTED') && (
                            <button className="relationship-button invite-button" onClick={handleInvite}>Send invitation</button>
                        )}
                    </div>
                </div>
            </div>
            <div className="news-section">
                <FriendsNewsList friendFsUserId={user.fsUserId} />
            </div>
        </div>
    );
};

export default FriendProfile;
