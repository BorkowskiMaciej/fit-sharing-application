import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import useToken from "../../hooks/useToken";
import NewsList from "../news/NewsList";
import {useRelationship} from "../../hooks/useRelationship";
import {useFetchUser} from "../../hooks/useFetchUser";
import UserProfileInfo from "./UserProfileInfo";

const FriendProfile: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [showActions, setShowActions] = useState(false);
    const { user, error } = useFetchUser(uuid);
    const { tokenData } = useToken();
    const authorizedFsUserId = tokenData?.fsUserId;

    const {
        relationshipStatus,
        senderFsUserId,
        sendInvite,
        deleteInvitation,
        acceptInvitation,
        rejectInvitation,
        deleteRelationship,
    } = useRelationship({fsUserId: uuid });

    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading...</div>;

    const actions = (
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
                            <li onClick={deleteRelationship}>Remove from friends</li>
                        </ul>
                    )}
                </div>
            )}
            {relationshipStatus === 'PENDING' && authorizedFsUserId === senderFsUserId && (
                <button className="relationship-button reject-button" onClick={deleteInvitation}>Delete invitation</button>
            )}
            {relationshipStatus === 'PENDING' && !(authorizedFsUserId === senderFsUserId) && (
                <div className="buttons-container">
                    <button className="relationship-button accept-button" onClick={acceptInvitation}>
                        Accept invitation
                    </button>
                    <button className="relationship-button reject-button" onClick={rejectInvitation}>
                        Reject invitation
                    </button>
                </div>
            )}
            {(relationshipStatus === 'NOT_FOUND' || relationshipStatus === 'REJECTED') && (
                <button className="relationship-button invite-button" onClick={sendInvite}>Send invitation</button>
            )}
        </div>
    )

    return (
        <div className="user-container">
            <UserProfileInfo user={user} actions={actions} />
            <div className="news-section">
                <NewsList url={`/news/received/${user.fsUserId}`} refreshKey={0} />
            </div>
        </div>
    );
};

export default FriendProfile;
