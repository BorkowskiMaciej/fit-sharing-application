import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useAuth} from "../../provider/authProvider";
import NewsList from "../news/NewsList";
import {useRelationship} from "../../hooks/useRelationship";
import {useFetchUser} from "../../hooks/useFetchUser";
import UserProfileInfo from "./UserProfileInfo";
import '../../styles/user-profile-styles.css';
import UserDashboard from "./UserDashboard";

const FriendProfile: React.FC = () => {
    const {uuid} = useParams<{ uuid: string }>();
    const [showActions, setShowActions] = useState(false);
    const {user, error} = useFetchUser(uuid);
    const {tokenData} = useAuth();
    const authorizedFsUserId = tokenData?.fsUserId;

    const {
        relationshipStatus,
        senderFsUserId,
        sendInvite,
        deleteInvitation,
        acceptInvitation,
        rejectInvitation,
        deleteRelationship,
    } = useRelationship({fsUserId: uuid});

    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading...</div>;

    const actions = (
        <div className='user-button-container'>
            {relationshipStatus === 'ACCEPTED' && (
                <div className="remove-user-container">
                    <div onClick={() => setShowActions(!showActions)}>
                        <svg viewBox="0 0 24 6" fill="currentColor">
                            <circle cx="3" cy="3" r="2.5"/>
                            <circle cx="12" cy="3" r="2.5"/>
                            <circle cx="21" cy="3" r="2.5"/>
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
    )

    return (
        <div className="user-container">
            <UserProfileInfo user={user} actions={actions}/>
            {relationshipStatus === 'ACCEPTED' ? (
                <div className="news-section">
                    <UserDashboard url={`/news/received/${user.fsUserId}`} refreshKey={0}/>
                    <NewsList url={`/news/received/${user.fsUserId}`} refreshKey={0}/>
                </div>
            ) :
                <div className='list-container'>
                    <p>To display a user's activities the user must be your friend.</p>
                </div>}
        </div>
    );
};

export default FriendProfile;
