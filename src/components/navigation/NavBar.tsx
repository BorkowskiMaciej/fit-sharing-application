import React from 'react';
import SearchBar from './SearchBar';
import {useNavigate} from "react-router-dom";
import GlobalMessages from "./GlobalMessage";

const Navbar: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className="navbar">
            <div className="navbar-section">
                <h2 className="navbar-title">Fit Sharing</h2>
                <div className="icon-container" onClick={() => navigate("/")}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
                    </svg>
                    <span>Home</span>
                </div>
                <SearchBar />
            </div>
            <GlobalMessages />
            <div className="navbar-section">
                <div className="icon-container" onClick={() => navigate("/friends")}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                    </svg>
                    <span>Friends</span>
                </div>
                <div className="icon-container" onClick={() => navigate("/user/me")}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                    <span>My profile</span>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
