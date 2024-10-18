import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../configuration/axiosConfig";
import useToken from "../../hooks/useToken";

interface UserCardProps {
    username: string,
    firstName: string,
    lastName: string,
    fsUserId: string,
}

const UserCard: React.FC<UserCardProps> = ({ username, firstName, lastName, fsUserId }) => {
    const navigate = useNavigate();
    const staticPhotoUrl = '/user-photo.jpg';
    const [relationshipStatus, setRelationshipStatus] = useState('');
    const [senderFsUserId, setSenderFsUserId] = useState('');
    const [relationshipId, setRelationshipId] = useState('');
    const { tokenData } = useToken();
    const authorizedFsUserId = tokenData?.fsUserId;

    const fetchRelationship = async (fsUserId: string) => {
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

    useEffect(() => {
        fetchRelationship(fsUserId);
    }, [fsUserId]);

    const handleInvite = async () => {
        try {
            await axiosInstance.post(`/relationships/send/${fsUserId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was sent', type: 'green' } }));
            fetchRelationship(fsUserId);
        } catch (error) {
            console.error('Failed to send invitation:', error);
        }
    };

    const handleDeleteInvitation = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was deleted', type: 'green' } }));
            fetchRelationship(fsUserId);
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };

    const handleDeleteRelationship = async () => {
        try {
            await axiosInstance.delete(`/relationships/delete/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Relationship was deleted', type: 'green' } }));
            fetchRelationship(fsUserId);
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };


    const handleAcceptInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/accept/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was accepted', type: 'green' } }));
            fetchRelationship(fsUserId);
        } catch (error) {
        }
    };

    const handleRejectInvitation = async () => {
        try {
            await axiosInstance.post(`/relationships/reject/${relationshipId}`);
            window.dispatchEvent(new CustomEvent('showMessage',
                { detail: { message: 'Invitation was rejected', type: 'green' } }));
            fetchRelationship(fsUserId);
        } catch (error) {
            console.error('Failed to delete invitation:', error);
        }
    };

    return (
        <div className="user-card-container">
            <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => navigate(`/user/${fsUserId}`)}>
                <img src={staticPhotoUrl} alt="User Photo" className="user-mini-photo"/>
                <div className="user-mini-info">
                    <h2 style={{ textAlign: 'left'}}>{username}</h2>
                    <p>{firstName} {lastName}</p>
                </div>
            </div>
                {relationshipStatus === 'ACCEPTED' && (
                    <button className="relationship-button reject-button" onClick={handleDeleteRelationship}>Remove from friends</button>
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
    );
};

export default UserCard;
