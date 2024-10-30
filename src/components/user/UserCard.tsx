import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../provider/authProvider";
import {useRelationship} from "../../hooks/useRelationship";
import '../../styles/user-card-styles.css';

interface UserCardProps {
    username: string,
    firstName: string,
    lastName: string,
    fsUserId: string,
    profilePicture: string | null
}

const UserCard: React.FC<UserCardProps> = ({ username, firstName, lastName, fsUserId, profilePicture}) => {
    const navigate = useNavigate();
    const defaultPhoto = '/user-photo.jpg';
    const { tokenData } = useAuth();
    const authorizedFsUserId = tokenData?.fsUserId;

    const {
        relationshipStatus,
        senderFsUserId,
        sendInvite,
        deleteInvitation,
        acceptInvitation,
        rejectInvitation
    } = useRelationship({ fsUserId });

    return (
        <div className="user-card-container">
            <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => navigate(`/user/${fsUserId}`)}>
                <img src={profilePicture ? profilePicture : defaultPhoto} alt="" className="user-mini-photo" />
                <div className="user-mini-info">
                    <h2 style={{ textAlign: 'left'}}>{username}</h2>
                    <p>{firstName} {lastName}</p>
                </div>
            </div>
                {relationshipStatus === 'PENDING' && authorizedFsUserId === senderFsUserId && (
                    <button className="relationship-button red-button" onClick={deleteInvitation}>Delete invitation</button>
                )}
                {relationshipStatus === 'PENDING' && !(authorizedFsUserId === senderFsUserId) && (
                    <div className="buttons-container">
                        <button className="relationship-button green-button" onClick={acceptInvitation}>
                            Accept invitation
                        </button>
                        <button className="relationship-button red-button" onClick={rejectInvitation}>
                            Reject invitation
                        </button>
                    </div>
                )}
                {(relationshipStatus === 'NOT_FOUND' || relationshipStatus === 'REJECTED') && (
                    <button className="relationship-button invite-button" onClick={sendInvite}>Send invitation</button>
                )}
        </div>
    );
};

export default UserCard;
