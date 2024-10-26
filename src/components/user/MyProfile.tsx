import React, {useState} from 'react';
import CreateNewsComponent from "../news/CreateNewsComponent";
import {useNavigate} from "react-router-dom";
import NewsList from "../news/NewsList";
import {useFetchUser} from "../../hooks/useFetchUser";
import UserProfileInfo from "./UserProfileInfo";

const MyProfile: React.FC = () => {
    const { user, error } = useFetchUser();
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const handleRefresh = () => setRefreshKey(prevKey => prevKey + 1);

    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading...</div>;

    const actions = (
        <div className="edit-profile-icon" style={{display: 'flex', flexDirection: 'row'}}>
            <div className="icon-container" onClick={() => navigate("/me/change-password")}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon edit-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <span>Change password</span>
            </div>
            <div className="icon-container" onClick={() => navigate("/me/edit")}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon edit-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z"/>
                </svg>
                <span>Edit profile</span>
            </div>
        </div>
    )

    return (
        <div className="user-container">
            <UserProfileInfo user={user} actions={actions}/>
            <div className="news-section">
                <CreateNewsComponent onSubmit={handleRefresh} />
                <NewsList url="/news/reference" refreshKey={refreshKey} />
            </div>
        </div>
    );
};

export default MyProfile;
